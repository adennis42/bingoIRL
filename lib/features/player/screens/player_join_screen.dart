import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/services/game_service.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/constants/bingo_constants.dart';
import 'player_game_screen.dart';
import '../../auth/providers/auth_provider.dart';

class PlayerJoinScreen extends StatefulWidget {
  const PlayerJoinScreen({super.key});

  @override
  State<PlayerJoinScreen> createState() => _PlayerJoinScreenState();
}

class _PlayerJoinScreenState extends State<PlayerJoinScreen> {
  final _formKey = GlobalKey<FormState>();
  final _gameCodeController = TextEditingController();
  final GameService _gameService = GameService();
  bool _isJoining = false;

  @override
  void dispose() {
    _gameCodeController.dispose();
    super.dispose();
  }

  Future<void> _joinGame() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isJoining = true;
    });

    try {
      final gameCode = _gameCodeController.text.trim().toUpperCase();
      
      // Validate game code format
      if (gameCode.length != BingoConstants.gameCodeLength) {
        throw Exception(AppConstants.errorInvalidGameCode);
      }

      // Get auth provider before async operations
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final authService = AuthService();

      // Sign in anonymously if not already signed in
      if (authService.currentUser == null) {
        await authProvider.signInAnonymously();
      }

      // Check if game exists
      final game = await _gameService.getGameByCode(gameCode);
      
      if (game == null) {
        throw Exception(AppConstants.errorGameNotFound);
      }

      if (game.isEnded) {
        throw Exception(AppConstants.errorGameExpired);
      }

      final playerId = authService.currentUserId;
      if (playerId == null) {
        throw Exception('Failed to authenticate player');
      }

      // Join the game
      await _gameService.joinGame(
        gameId: game.id,
        playerId: playerId,
      );

      if (!mounted) return;

      // Navigate to game screen
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => PlayerGameScreen(gameId: game.id),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isJoining = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Join Game'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 32),
                Icon(
                  Icons.games,
                  size: 64,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(height: 16),
                Text(
                  'Join Bingo Game',
                  style: Theme.of(context).textTheme.headlineLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Enter the game code to join',
                  style: Theme.of(context).textTheme.bodyLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 48),
                TextFormField(
                  controller: _gameCodeController,
                  textAlign: TextAlign.center,
                  textCapitalization: TextCapitalization.characters,
                  maxLength: BingoConstants.gameCodeLength,
                  style: Theme.of(context).textTheme.headlineMedium,
                  decoration: InputDecoration(
                    labelText: 'Game Code',
                    hintText: 'ABCD12',
                    counterText: '',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a game code';
                    }
                    if (value.length != BingoConstants.gameCodeLength) {
                      return 'Game code must be ${BingoConstants.gameCodeLength} characters';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isJoining ? null : _joinGame,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _isJoining
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Join Game'),
                ),
                const SizedBox(height: 16),
                Text(
                  'Ask your host for the 6-digit game code',
                  style: Theme.of(context).textTheme.bodySmall,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

