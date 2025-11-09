import 'package:flutter/material.dart';
import '../../../core/services/game_service.dart';
import '../../../core/constants/bingo_colors.dart';
import '../../../shared/models/called_number.dart';
import '../../../features/host/models/game.dart';
import '../../../shared/models/game_status.dart';
import '../../../shared/models/round.dart';
import '../../../shared/models/winning_pattern.dart';
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
                        currentRound.isCustomPattern
                            ? 'Pattern: ${currentRound.customPattern!.name}'
                            : 'Pattern: ${currentRound.pattern?.displayName ?? 'Custom Pattern'}',
                        style: Theme.of(context).textTheme.titleMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        currentRound.isCustomPattern
                            ? (currentRound.customPattern?.description?.isNotEmpty ?? false)
                                ? currentRound.customPattern!.description!
                                : 'Custom winning pattern selected by host.'
                            : currentRound.pattern?.description ?? '',
                        style: Theme.of(context).textTheme.bodySmall,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      _PatternPreview(
                        pattern: currentRound,
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

class _PatternPreview extends StatelessWidget {
  const _PatternPreview({required this.pattern});

  final Round pattern;

  static const _gridSize = 5;
  static const _headers = ['B', 'I', 'N', 'G', 'O'];
  static const double _cellSize = 20;
  static const double _spacing = 3;

  bool _isCellHighlighted(int row, int col) {
    if (pattern.isCustomPattern) {
      final cells = pattern.customPattern?.cells ?? [];
      return cells.contains('$row,$col');
    }

    final builtIn = pattern.pattern;
    if (builtIn == null) {
      return false;
    }

    switch (builtIn) {
      case WinningPattern.traditionalLine:
        return row == 2 || col == 2 || row == col || row + col == _gridSize - 1;
      case WinningPattern.fourCorners:
        return (row == 0 && col == 0) ||
            (row == 0 && col == _gridSize - 1) ||
            (row == _gridSize - 1 && col == 0) ||
            (row == _gridSize - 1 && col == _gridSize - 1);
      case WinningPattern.blackout:
        return true;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: Theme.of(context).colorScheme.surfaceVariant,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Pattern Preview',
            style: Theme.of(context).textTheme.titleSmall,
          ),
          const SizedBox(height: 8),
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: _gridSize * _cellSize + (_gridSize - 1) * _spacing,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: List.generate(_gridSize, (index) {
                      final letter = _headers[index];
                      return Container(
                        width: _cellSize,
                        height: _cellSize,
                        decoration: BoxDecoration(
                          color: BingoColors.getColumnColor(letter),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Center(
                          child: Text(
                            letter,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                      );
                    }),
                  ),
                ),
                const SizedBox(height: 6),
                SizedBox(
                  width: _gridSize * _cellSize + (_gridSize - 1) * _spacing,
                  height: _gridSize * _cellSize + (_gridSize - 1) * _spacing,
                  child: GridView.builder(
                    padding: EdgeInsets.zero,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: _gridSize,
                      crossAxisSpacing: _spacing,
                      mainAxisSpacing: _spacing,
                    ),
                    itemCount: _gridSize * _gridSize,
                    itemBuilder: (context, index) {
                      final row = index ~/ _gridSize;
                      final col = index % _gridSize;
                      final letter = _headers[col];
                      final isCenter = row == 2 && col == 2;
                      final highlight = _isCellHighlighted(row, col);

                      Color cellColor;
                      Color borderColor;
                      Color textColor;

                      if (pattern.isCustomPattern) {
                        cellColor = highlight ? const Color(0xFFE53935) : Colors.white;
                        borderColor = highlight ? const Color(0xFFB71C1C) : Colors.grey.shade300;
                        textColor = highlight ? Colors.white : Colors.grey.shade400;
                      } else {
                        cellColor = highlight
                            ? BingoColors.getColumnColor(letter, isCalled: true)
                            : Colors.white;
                        borderColor = highlight
                            ? BingoColors.getColumnBorderColor(letter)
                            : Colors.grey.shade300;
                        textColor = highlight
                            ? BingoColors.getColumnTextColor(letter, isCalled: true)
                            : Colors.grey.shade400;
                      }

                      return Container(
                        decoration: BoxDecoration(
                          color: cellColor,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: borderColor),
                        ),
                        child: Center(
                          child: Text(
                            isCenter ? '★' : '',
                            style: TextStyle(
                              color: textColor,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}


