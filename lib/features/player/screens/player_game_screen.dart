import 'package:flutter/material.dart';
import '../../../core/services/game_service.dart';
import '../../../core/constants/bingo_colors.dart';
import '../../../shared/models/called_number.dart';
import '../../../features/host/models/game.dart';
import '../../../shared/models/game_status.dart';
import '../../../shared/widgets/bingo_ball.dart';

class PlayerGameScreen extends StatefulWidget {
  final String gameId;

  const PlayerGameScreen({
    super.key,
    required this.gameId,
  });

  @override
  State<PlayerGameScreen> createState() => _PlayerGameScreenState();
}

class _PlayerGameScreenState extends State<PlayerGameScreen> {
  final GameService _gameService = GameService();
  Game? _game;
  List<CalledNumber> _calledNumbers = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadGame();
  }

  void _loadGame() {
    _gameService.streamGame(widget.gameId).listen((game) {
      if (mounted) {
        setState(() {
          _game = game;
          _isLoading = false;
        });
      }
    }, onError: (error) {
      if (mounted) {
        setState(() {
          _error = error.toString();
          _isLoading = false;
        });
      }
    });

    _gameService.streamCalledNumbers(widget.gameId).listen((numbers) {
      if (mounted) {
        setState(() {
          _calledNumbers = numbers;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null || _game == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Game')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: Theme.of(context).colorScheme.error,
              ),
              const SizedBox(height: 16),
              Text(
                _error ?? 'Game not found',
                style: Theme.of(context).textTheme.titleLarge,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    final game = _game!;
    final lastCalled = _calledNumbers.isEmpty
        ? null
        : _calledNumbers.last;
    final currentRound = game.currentRoundObject;

    return Scaffold(
      appBar: AppBar(
        title: Text('Game: ${game.gameCode}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              // Refresh is handled by streams
            },
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Game Status Card
            Card(
              margin: const EdgeInsets.all(16),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Text(
                      game.status == GameStatus.setup
                          ? 'Waiting to Start'
                          : 'Round ${game.currentRound}/${game.totalRounds}',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    if (currentRound != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        'Pattern: ${currentRound.pattern.displayName}',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        currentRound.pattern.description,
                        style: Theme.of(context).textTheme.bodySmall,
                        textAlign: TextAlign.center,
                      ),
                      if (currentRound.prize != null) ...[
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.primaryContainer,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'Prize: ${currentRound.prize}',
                            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                                ),
                          ),
                        ),
                      ],
                      if (currentRound.isCompleted) ...[
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.green,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'Winner: ${currentRound.winnerName ?? "Unknown"}',
                            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  color: Colors.white,
                                ),
                          ),
                        ),
                      ],
                    ],
                  ],
                ),
              ),
            ),

            // Last Called Number (Bingo Ball)
            if (lastCalled != null && game.isActive)
              BingoBallDisplay(
                number: lastCalled.number,
                label: 'Last Called',
              ),

            // Game status messages
            if (game.status == GameStatus.setup) ...[
              Padding(
                padding: const EdgeInsets.all(32.0),
                child: Column(
                  children: [
                    Icon(
                      Icons.hourglass_empty,
                      size: 64,
                      color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.5),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Waiting for host to start the game...',
                      style: Theme.of(context).textTheme.titleMedium,
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ] else if (game.isEnded) ...[
              Padding(
                padding: const EdgeInsets.all(32.0),
                child: Column(
                  children: [
                    Icon(
                      Icons.check_circle,
                      size: 64,
                      color: Colors.green,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Game Ended',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Thank you for playing!',
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  ],
                ),
              ),
            ],

            // Called Numbers List (only show when game is active)
            if (game.isActive && _calledNumbers.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(16.0, 24.0, 16.0, 8.0),
                child: Text(
                  'Called Numbers (${_calledNumbers.length}/75)',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: _calledNumbers.map((called) {
                    final columnLetter = called.number[0];
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: BingoColors.getColumnColor(columnLetter, isCalled: true),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: BingoColors.getColumnBorderColor(columnLetter),
                          width: 1.5,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: BingoColors.getColumnColor(columnLetter)
                                .withValues(alpha: 0.2),
                            blurRadius: 2,
                            offset: const Offset(0, 1),
                          ),
                        ],
                      ),
                      child: Text(
                        called.number,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: BingoColors.getColumnTextColor(columnLetter, isCalled: true),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}


