import 'package:flutter/material.dart';
import '../../../core/services/game_service.dart';
import '../../../core/services/auth_service.dart';
import '../../../shared/models/round.dart';
import '../../../shared/models/winning_pattern.dart';
import '../../../shared/models/custom_pattern.dart';
import '../../../core/constants/bingo_constants.dart';
import '../models/custom_pattern.dart' as draft;
import 'pattern_builder_screen.dart';
import '../models/custom_pattern.dart' as draft;
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
  final List<CustomPattern> _customPatterns = [];

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
        builtInPattern: WinningPattern.traditionalLine,
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
            builtInPattern: WinningPattern.traditionalLine,
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
        if (config.isCustom) {
          return Round(
            roundNumber: config.roundNumber,
            customPattern: config.customPattern,
            prize: config.prize.isEmpty ? null : config.prize,
          );
        }
        return Round(
          roundNumber: config.roundNumber,
          pattern: config.builtInPattern ?? WinningPattern.traditionalLine,
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

  Future<CustomPattern?> _handleCreateCustomPattern() async {
    final draft.CustomPatternDraft? patternDraft = await Navigator.push<draft.CustomPatternDraft>(
      context,
      MaterialPageRoute(
        builder: (context) => const PatternBuilderScreen(),
      ),
    );

    if (!mounted || patternDraft == null || !patternDraft.hasSelection) {
      return null;
    }

    final custom = patternDraft.toCustomPattern();
    if (_customPatterns.any((existing) => existing.id == custom.id)) {
      return custom;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Custom pattern "${custom.name}" created'),
        duration: const Duration(seconds: 2),
      ),
    );

    return custom;
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
                  customPatterns: _customPatterns,
                  onBuiltInPatternSelected: (pattern) {
                    setState(() {
                      _rounds[index] = round.withBuiltInPattern(pattern);
                    });
                  },
                  onCustomPatternSelected: (pattern) {
                    setState(() {
                      _rounds[index] = round.withCustomPattern(pattern);
                    });
                  },
                  onCreateCustomPattern: () async {
                    final created = await _handleCreateCustomPattern();
                    if (created != null) {
                      setState(() {
                        _customPatterns.add(created);
                        _rounds[index] = round.withCustomPattern(created);
                      });
                    }
                  },
                  onPrizeChanged: (prize) {
                    setState(() {
                      _rounds[index] = round.copyWithPrize(prize);
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
  final WinningPattern? builtInPattern;
  final CustomPattern? customPattern;
  final String prize;

  RoundConfig({
    required this.roundNumber,
    this.builtInPattern,
    this.customPattern,
    required this.prize,
  }) : assert(builtInPattern != null || customPattern != null,
            'Either builtInPattern or customPattern must be provided');

  bool get isCustom => customPattern != null;

  RoundConfig withBuiltInPattern(WinningPattern pattern) {
    return RoundConfig(
      roundNumber: roundNumber,
      builtInPattern: pattern,
      customPattern: null,
      prize: prize,
    );
  }

  RoundConfig withCustomPattern(CustomPattern pattern) {
    return RoundConfig(
      roundNumber: roundNumber,
      builtInPattern: null,
      customPattern: pattern,
      prize: prize,
    );
  }

  RoundConfig copyWithPrize(String newPrize) {
    return RoundConfig(
      roundNumber: roundNumber,
      builtInPattern: builtInPattern,
      customPattern: customPattern,
      prize: newPrize,
    );
  }
}

class _RoundConfigurationCard extends StatelessWidget {
  final RoundConfig round;
  final List<CustomPattern> customPatterns;
  final ValueChanged<WinningPattern> onBuiltInPatternSelected;
  final ValueChanged<CustomPattern> onCustomPatternSelected;
  final Future<void> Function() onCreateCustomPattern;
  final ValueChanged<String> onPrizeChanged;

  const _RoundConfigurationCard({
    required this.round,
    required this.customPatterns,
    required this.onBuiltInPatternSelected,
    required this.onCustomPatternSelected,
    required this.onCreateCustomPattern,
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
            _PatternDropdown(
              round: round,
              customPatterns: customPatterns,
              onBuiltInPatternSelected: onBuiltInPatternSelected,
              onCustomPatternSelected: onCustomPatternSelected,
              onCreateCustomPattern: onCreateCustomPattern,
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

class _PatternDropdown extends StatelessWidget {
  const _PatternDropdown({
    required this.round,
    required this.customPatterns,
    required this.onBuiltInPatternSelected,
    required this.onCustomPatternSelected,
    required this.onCreateCustomPattern,
  });

  final RoundConfig round;
  final List<CustomPattern> customPatterns;
  final ValueChanged<WinningPattern> onBuiltInPatternSelected;
  final ValueChanged<CustomPattern> onCustomPatternSelected;
  final Future<void> Function() onCreateCustomPattern;

  String get _selectedValue {
    if (round.isCustom && round.customPattern != null) {
      return 'custom:${round.customPattern!.id}';
    }
    final builtIn = round.builtInPattern ?? WinningPattern.traditionalLine;
    return 'builtIn:${builtIn.name}';
  }

  @override
  Widget build(BuildContext context) {
    final builtInItems = WinningPattern.values.map((pattern) {
      return DropdownMenuItem<String>(
        value: 'builtIn:${pattern.name}',
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
    }).toList();

    final List<DropdownMenuItem<String>> items = [
      ...builtInItems,
      DropdownMenuItem<String>(
        value: 'divider',
        enabled: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4.0),
          child: Text(
            'Custom Patterns',
            style: Theme.of(context).textTheme.labelSmall,
          ),
        ),
      ),
      if (customPatterns.isEmpty)
        DropdownMenuItem<String>(
          value: 'no_custom',
          enabled: false,
          child: Text(
            'No custom patterns (yet)',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        )
      else
        ...customPatterns.map((pattern) {
          return DropdownMenuItem<String>(
            value: 'custom:${pattern.id}',
            child: Text(pattern.name),
          );
        }),
      DropdownMenuItem<String>(
        value: 'action:create',
        child: Row(
          children: [
            const Icon(Icons.add, size: 18),
            const SizedBox(width: 6),
            Text(
              'Create custom pattern…',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    ];

    return DropdownButtonFormField<String>(
      value: _selectedValue,
      items: items,
      onChanged: (value) {
        if (value == null) return;
        if (value.startsWith('builtIn:')) {
          final patternName = value.substring('builtIn:'.length);
          final selected = WinningPattern.values.firstWhere(
            (p) => p.name == patternName,
            orElse: () => WinningPattern.traditionalLine,
          );
          onBuiltInPatternSelected(selected);
        } else if (value.startsWith('custom:')) {
          final customId = value.substring('custom:'.length);
          if (customPatterns.isNotEmpty) {
            final selected = customPatterns.firstWhere(
              (pattern) => pattern.id == customId,
              orElse: () => customPatterns.first,
            );
            onCustomPatternSelected(selected);
          }
        } else if (value == 'action:create') {
          onCreateCustomPattern();
        }
      },
    );
  }
}

