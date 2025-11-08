import 'package:flutter/material.dart';
import '../../../core/services/game_service.dart';
import '../../../core/constants/bingo_constants.dart';
import '../../../core/constants/bingo_colors.dart';
import '../../../shared/models/game_status.dart';
import '../../../shared/models/called_number.dart';
import '../../../features/host/models/game.dart';
import '../../../features/player/models/player.dart';
import '../../../shared/widgets/bingo_ball.dart';
import 'package:qr_flutter/qr_flutter.dart';

class HostGameScreen extends StatefulWidget {
  final String gameId;

  const HostGameScreen({
    super.key,
    required this.gameId,
  });

  @override
  State<HostGameScreen> createState() => _HostGameScreenState();
}

class _HostGameScreenState extends State<HostGameScreen> {
  final GameService _gameService = GameService();
  Game? _game;
  List<CalledNumber> _calledNumbers = [];
  List<Player> _players = [];
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

    _gameService.streamPlayers(widget.gameId).listen((players) {
      if (mounted) {
        setState(() {
          _players = players;
        });
      }
    });
  }

  Future<void> _callNumber(String number) async {
    try {
      final sequence = _calledNumbers.length + 1;
      await _gameService.callNumber(
        gameId: widget.gameId,
        number: number,
        sequence: sequence,
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to call number: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _undoLastNumber() async {
    try {
      await _gameService.undoLastCalledNumber(widget.gameId);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to undo: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _startGame() async {
    try {
      await _gameService.startGame(widget.gameId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Game started!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to start game: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _markWinner() async {
    if (_game == null || _game!.currentRoundObject == null) return;

    final round = _game!.currentRoundObject!;
    final winnerNameController = TextEditingController();

    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Mark Winner - Round ${round.roundNumber}'),
        content: TextField(
          controller: winnerNameController,
          decoration: const InputDecoration(
            labelText: 'Winner Name',
            hintText: 'Enter winner name',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              if (winnerNameController.text.isNotEmpty) {
                Navigator.pop(context, winnerNameController.text);
              }
            },
            child: const Text('Mark Winner'),
          ),
        ],
      ),
    );

    if (result != null && _game != null) {
      try {
        final winnerId = 'winner_${DateTime.now().millisecondsSinceEpoch}';
        
        await _gameService.markWinner(
          gameId: widget.gameId,
          roundNumber: _game!.currentRound,
          winnerId: winnerId,
          winnerName: result,
        );

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Winner marked!'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to mark winner: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> _endGame() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('End Game'),
        content: const Text('Are you sure you want to end this game?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('End Game'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await _gameService.endGame(widget.gameId);
        if (mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Game ended'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to end game: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
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
          child: Text(_error ?? 'Game not found'),
        ),
      );
    }

    final game = _game!;
    final lastCalled = _calledNumbers.isEmpty
        ? null
        : _calledNumbers.last;
    final currentRound = game.currentRoundObject;
    final calledNumbersSet = _calledNumbers.map((n) => n.number).toSet();

    return Scaffold(
      appBar: AppBar(
        title: Text('Game: ${game.gameCode}'),
        actions: [
          if (game.isActive)
            IconButton(
              icon: const Icon(Icons.flag),
              onPressed: _markWinner,
              tooltip: 'Mark Winner',
            ),
          IconButton(
            icon: const Icon(Icons.stop),
            onPressed: _endGame,
            tooltip: 'End Game',
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Game Info Card
            Card(
              margin: const EdgeInsets.all(16),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    if (game.status == GameStatus.setup) ...[
                      Text(
                        'Game Setup',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 16),
                      QrImageView(
                        data: game.gameCode,
                        size: 200,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Game Code: ${game.gameCode}',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _startGame,
                        child: const Text('Start Game'),
                      ),
                    ] else ...[
                      Text(
                        'Round ${game.currentRound}/${game.totalRounds}',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      if (currentRound != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          'Pattern: ${currentRound.pattern.displayName}',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        if (currentRound.prize != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            'Prize: ${currentRound.prize}',
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                        ],
                      ],
                      const SizedBox(height: 16),
                      Text(
                        'Players: ${_players.length}',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
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

            // Bingo Number Grid
            if (game.isActive) ...[
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  'Call Numbers',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
              _BingoNumberGrid(
                calledNumbers: calledNumbersSet,
                onNumberTap: _callNumber,
              ),
              const SizedBox(height: 16),
              if (_calledNumbers.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: OutlinedButton.icon(
                    onPressed: _undoLastNumber,
                    icon: const Icon(Icons.undo),
                    label: const Text('Undo Last Number'),
                  ),
                ),
            ],

            // Called Numbers History
            if (_calledNumbers.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  'Called Numbers (${_calledNumbers.length})',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _calledNumbers.map((called) {
                    return Chip(
                      label: Text(called.number),
                      backgroundColor: Theme.of(context).colorScheme.primaryContainer,
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

class _BingoNumberGrid extends StatelessWidget {
  final Set<String> calledNumbers;
  final ValueChanged<String> onNumberTap;

  const _BingoNumberGrid({
    required this.calledNumbers,
    required this.onNumberTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 16.0),
      child: Column(
        children: BingoConstants.columns.map((column) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 6.0),
            child: Row(
              children: [
                // Column header
                Container(
                  width: 40,
                  height: 50,
                  margin: const EdgeInsets.only(right: 8.0),
                  decoration: BoxDecoration(
                    color: BingoColors.getColumnColor(column),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: BingoColors.getColumnBorderColor(column),
                      width: 2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
                        blurRadius: 2,
                        offset: const Offset(0, 1),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      column,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: BingoColors.getColumnTextColor(column),
                      ),
                    ),
                  ),
                ),
                // Numbers in column
                Expanded(
                  child: Row(
                    children: BingoConstants.getNumbersForColumn(column).map((number) {
                      final bingoNumber = BingoConstants.formatBingoNumber(number);
                      final isCalled = calledNumbers.contains(bingoNumber);
                      final columnLetter = bingoNumber[0];
                  final Color baseColor = BingoColors.getColumnColor(columnLetter, isCalled: isCalled);
                  final Color fillColor = isCalled ? _darkenColor(baseColor, 0.12) : baseColor;
                  final double boxHeight = isCalled ? 46 : 54;
                  final double fontSize = isCalled ? 15 : 17;
                      
                      return Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 2.0),
                          child: InkWell(
                            onTap: isCalled ? null : () => onNumberTap(bingoNumber),
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                            height: boxHeight,
                              decoration: BoxDecoration(
                              color: fillColor,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: BingoColors.getColumnBorderColor(columnLetter),
                                width: isCalled ? 2.2 : 1.5,
                                ),
                                boxShadow: isCalled
                                    ? [
                                        BoxShadow(
                                        color: fillColor.withValues(alpha: 0.35),
                                        blurRadius: 6,
                                        offset: const Offset(0, 2),
                                        ),
                                      ]
                                    : [
                                        BoxShadow(
                                          color: Colors.black.withValues(alpha: 0.05),
                                          blurRadius: 1,
                                          offset: const Offset(0, 1),
                                        ),
                                      ],
                              ),
                              child: Center(
                                child: Text(
                                  number.toString(),
                                  style: TextStyle(
                                  fontSize: fontSize,
                                    fontWeight: isCalled ? FontWeight.bold : FontWeight.w600,
                                    color: BingoColors.getColumnTextColor(columnLetter, isCalled: isCalled),
                                    decoration: isCalled ? TextDecoration.lineThrough : null,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Color _darkenColor(Color color, double amount) {
    final hsl = HSLColor.fromColor(color);
    final double lightness = (hsl.lightness - amount).clamp(0.0, 1.0);
    return hsl.withLightness(lightness).toColor();
  }
}


