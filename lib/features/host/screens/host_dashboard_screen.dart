import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../auth/providers/auth_provider.dart';
import '../../auth/screens/login_screen.dart';
import 'create_game_screen.dart';
import 'host_game_screen.dart';
import '../../../core/services/game_service.dart';
import '../../../core/services/firestore_service.dart';
import '../../../core/services/auth_service.dart';
import '../models/game.dart';
import '../models/custom_pattern.dart';
import 'pattern_builder_screen.dart';

class HostDashboardScreen extends StatelessWidget {
  const HostDashboardScreen({super.key});

  Future<void> _confirmDeleteGame(BuildContext context, String gameId, String gameCode) async {
    final gameService = GameService();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Game'),
        content: Text('Are you sure you want to delete game $gameCode?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      await gameService.deleteGame(gameId);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Game $gameCode deleted.')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to delete game: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final gameService = GameService();
    final firestoreService = FirestoreService();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bingo Host'),
        actions: [
          IconButton(
            icon: const Icon(Icons.grid_view_rounded),
            tooltip: 'Custom Patterns',
            onPressed: () async {
              final draft = await Navigator.push<CustomPatternDraft>(
                context,
                MaterialPageRoute(
                  builder: (context) => const PatternBuilderScreen(),
                ),
              );

              if (draft != null && context.mounted) {
                final hostId = AuthService().currentUserId;
                if (hostId == null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Unable to determine host account. Try again.'),
                      backgroundColor: Colors.red,
                    ),
                  );
                  return;
                }
                try {
                  final saved = await firestoreService.createCustomPattern(
                    userId: hostId,
                    draftPattern: draft,
                  );
                  if (!context.mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Custom pattern "${saved.name}" saved successfully.'),
                    ),
                  );
                } catch (e) {
                  if (!context.mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Failed to save pattern: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await authProvider.signOut();
              if (context.mounted) {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const LoginScreen(),
                  ),
                );
              }
            },
            tooltip: 'Sign Out',
          ),
        ],
      ),
      body: StreamBuilder<List<Game>>(
        stream: gameService.streamHostedGames(authProvider.user!.uid),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Text('Error: ${snapshot.error}'),
            );
          }

          final games = snapshot.data ?? [];

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome, ${authProvider.user?.displayName ?? 'Host'}!',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Create a new game or manage existing games',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
              Expanded(
                child: games.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                      Icon(
                        Icons.games,
                        size: 64,
                        color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.5),
                      ),
                            const SizedBox(height: 16),
                            Text(
                              'No games yet',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Create your first game to get started',
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: games.length,
                        itemBuilder: (context, index) {
                          final game = games[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            child: ListTile(
                              title: Text('Game: ${game.gameCode}'),
                              subtitle: Text(
                                'Status: ${game.status.displayName} • '
                                'Round: ${game.currentRound}/${game.totalRounds}',
                              ),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    game.isActive
                                        ? Icons.play_circle
                                        : game.isEnded
                                            ? Icons.check_circle
                                            : Icons.schedule,
                                    color: game.isActive
                                        ? Colors.green
                                        : game.isEnded
                                            ? Colors.grey
                                            : Colors.orange,
                                  ),
                                  PopupMenuButton<String>(
                                    onSelected: (value) {
                                      if (value == 'delete') {
                                        _confirmDeleteGame(context, game.id, game.gameCode);
                                      }
                                    },
                                    itemBuilder: (context) => const [
                                      PopupMenuItem(
                                        value: 'delete',
                                        child: Text('Delete Game'),
                                      ),
                                    ],
                                    icon: const Icon(Icons.more_vert),
                                  ),
                                ],
                              ),
                              onTap: () {
                                if (game.isActive || game.status.name == 'setup') {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => HostGameScreen(gameId: game.id),
                                    ),
                                  );
                                }
                              },
                            ),
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const CreateGameScreen(),
            ),
          );
        },
        icon: const Icon(Icons.add),
        label: const Text('Create Game'),
      ),
    );
  }
}

