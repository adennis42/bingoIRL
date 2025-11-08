import 'package:flutter/material.dart';
import '../../../core/services/game_service.dart';
import '../../../core/services/auth_service.dart';
import '../../../shared/models/round.dart';
import '../../../shared/models/winning_pattern.dart';
import '../../../core/constants/bingo_constants.dart';
import 'host_game_screen.dart';

class CreateGameScreen extends StatefulWidget {
  const CreateGameScreen({super.key});

  @override
  State<CreateGameScreen> createState() => _CreateGameScreenState();
}

class _CreateGameScreenState extends State<CreateGameScreen> {
  final _formKey = GlobalKey<FormState>();
  int _totalRounds = 1;
  final List<RoundConfig> _rounds = [];
  bool _isCreating = false;

  @override
  void initState() {
    super.initState();
    _initializeRounds();
  }

  void _initializeRounds() {
    _rounds.clear();
    for (int i = 1; i <= _totalRounds; i++) {
      _rounds.add(RoundConfig(
        roundNumber: i,
        pattern: WinningPattern.traditionalLine,
        prize: '',
      ));
    }
  }

  void _updateTotalRounds(int value) {
    setState(() {
      _totalRounds = value;
      if (_rounds.length < value) {
        // Add new rounds
        for (int i = _rounds.length + 1; i <= value; i++) {
          _rounds.add(RoundConfig(
            roundNumber: i,
            pattern: WinningPattern.traditionalLine,
            prize: '',
          ));
        }
      } else if (_rounds.length > value) {
        // Remove excess rounds
        _rounds.removeRange(value, _rounds.length);
      }
    });
  }

  Future<void> _createGame() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isCreating = true;
    });

    try {
      final authService = AuthService();
      final gameService = GameService();
      final hostId = authService.currentUserId;

      if (hostId == null) {
        throw Exception('User not authenticated');
      }

      final rounds = _rounds.map((config) {
        return Round(
          roundNumber: config.roundNumber,
          pattern: config.pattern,
          prize: config.prize.isEmpty ? null : config.prize,
        );
      }).toList();

      final game = await gameService.createGame(
        hostId: hostId,
        totalRounds: _totalRounds,
        rounds: rounds,
      );

      if (!mounted) return;

      // Navigate to game screen
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => HostGameScreen(gameId: game.id),
        ),
      );

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Game created successfully!'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to create game: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isCreating = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create New Game'),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Game Configuration',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 24),
              Text(
                'Number of Rounds',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove),
                    onPressed: _totalRounds > BingoConstants.minRounds
                        ? () => _updateTotalRounds(_totalRounds - 1)
                        : null,
                  ),
                  Text(
                    '$_totalRounds',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  IconButton(
                    icon: const Icon(Icons.add),
                    onPressed: _totalRounds < BingoConstants.maxRounds
                        ? () => _updateTotalRounds(_totalRounds + 1)
                        : null,
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Text(
                'Round Configuration',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 16),
              ..._rounds.asMap().entries.map((entry) {
                final index = entry.key;
                final round = entry.value;
                return _RoundConfigurationCard(
                  round: round,
                  onPatternChanged: (pattern) {
                    setState(() {
                      _rounds[index] = round.copyWith(pattern: pattern);
                    });
                  },
                  onPrizeChanged: (prize) {
                    setState(() {
                      _rounds[index] = round.copyWith(prize: prize);
                    });
                  },
                );
              }),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isCreating ? null : _createGame,
                child: _isCreating
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Create Game'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class RoundConfig {
  final int roundNumber;
  final WinningPattern pattern;
  final String prize;

  RoundConfig({
    required this.roundNumber,
    required this.pattern,
    required this.prize,
  });

  RoundConfig copyWith({
    int? roundNumber,
    WinningPattern? pattern,
    String? prize,
  }) {
    return RoundConfig(
      roundNumber: roundNumber ?? this.roundNumber,
      pattern: pattern ?? this.pattern,
      prize: prize ?? this.prize,
    );
  }
}

class _RoundConfigurationCard extends StatelessWidget {
  final RoundConfig round;
  final ValueChanged<WinningPattern> onPatternChanged;
  final ValueChanged<String> onPrizeChanged;

  const _RoundConfigurationCard({
    required this.round,
    required this.onPatternChanged,
    required this.onPrizeChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Round ${round.roundNumber}',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Text(
              'Winning Pattern',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<WinningPattern>(
              initialValue: round.pattern,
              items: WinningPattern.values.map((pattern) {
                return DropdownMenuItem(
                  value: pattern,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(pattern.displayName),
                      Text(
                        pattern.description,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                );
              }).toList(),
              onChanged: (value) {
                if (value != null) {
                  onPatternChanged(value);
                }
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              decoration: const InputDecoration(
                labelText: 'Prize (Optional)',
                hintText: 'e.g., 50 Dollar Gift Card',
              ),
              initialValue: round.prize,
              onChanged: onPrizeChanged,
            ),
          ],
        ),
      ),
    );
  }
}

