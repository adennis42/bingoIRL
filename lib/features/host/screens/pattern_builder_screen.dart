import 'package:flutter/material.dart';
import '../models/custom_pattern.dart';
import 'dart:math' as math;

import '../../../core/constants/bingo_colors.dart';

class PatternBuilderScreen extends StatefulWidget {
  const PatternBuilderScreen({super.key});

  @override
  State<PatternBuilderScreen> createState() => _PatternBuilderScreenState();
}

class _PatternBuilderScreenState extends State<PatternBuilderScreen>
    with SingleTickerProviderStateMixin {
  static const int gridSize = 5;
  static const List<String> bingoHeaders = ['B', 'I', 'N', 'G', 'O'];

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final Set<String> _selectedCells = <String>{};
  bool _showWarnings = false;
  late AnimationController _twistController;

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _twistController.dispose();
    super.dispose();
  }

  String _cellKey(int row, int col) => '$row,$col';

  @override
  void initState() {
    super.initState();
    _twistController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
  }

  void _toggleCell(int row, int col) {
    final key = _cellKey(row, col);
    final wasSelected = _selectedCells.contains(key);
    setState(() {
      if (wasSelected) {
        _selectedCells.remove(key);
      } else {
        _selectedCells.add(key);
      }
    });

    if (!wasSelected) {
      _twistController
        ..reset()
        ..forward();
    }
  }

  void _clearSelection() {
    setState(() {
      _selectedCells.clear();
    });
  }

  bool get _isValid => _nameController.text.trim().isNotEmpty && _selectedCells.isNotEmpty;

  void _handleSave() {
    setState(() {
      _showWarnings = true;
    });

    if (!_isValid) return;

    final draftPattern = CustomPatternDraft(
      name: _nameController.text.trim(),
      description: _descriptionController.text.trim(),
      selectedCells: Set<String>.from(_selectedCells),
    );

    Navigator.of(context).pop(draftPattern);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('New Winning Pattern'),
        actions: [
          TextButton(
            onPressed: _isValid ? _handleSave : null,
            child: const Text('Save'),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: _nameController,
                  decoration: InputDecoration(
                    labelText: 'Pattern Name',
                    hintText: 'e.g. Four Corners + Center',
                    errorText: _showWarnings && _nameController.text.trim().isEmpty
                        ? 'Please enter a pattern name'
                        : null,
                  ),
                ),
              const SizedBox(height: 12),
              TextField(
                controller: _descriptionController,
                maxLines: 2,
                decoration: const InputDecoration(
                  labelText: 'Description (Optional)',
                  hintText: 'Describe how to win with this pattern',
                ),
              ),
                const SizedBox(height: 16),
              Text(
                'Select cells to include in the winning pattern.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: _selectedCells.isEmpty ? null : _clearSelection,
                  child: const Text('Clear'),
                ),
              ),
                const SizedBox(height: 8),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final double maxGridSize = 280;
                    final double gridSizePx = constraints.maxWidth.clamp(0, maxGridSize);
                    final double cellSpacing = 6;
                    final double headerHeight = 30;

                    return Center(
                      child: SizedBox(
                        width: gridSizePx,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // Header row with BINGO letters
                            Row(
                              children: List.generate(gridSize, (index) {
                                final letter = bingoHeaders[index];
                                return Expanded(
                                  child: Container(
                                    height: headerHeight,
                                    margin: const EdgeInsets.symmetric(horizontal: 2),
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
                                  ),
                                );
                              }),
                            ),
                            const SizedBox(height: 8),
                            SizedBox(
                              height: gridSizePx,
                              child: GridView.builder(
                                physics: const NeverScrollableScrollPhysics(),
                                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: gridSize,
                                  crossAxisSpacing: cellSpacing,
                                  mainAxisSpacing: cellSpacing,
                                ),
                                itemCount: gridSize * gridSize,
                                itemBuilder: (context, index) {
                                  final row = index ~/ gridSize;
                                  final col = index % gridSize;
                                  final key = _cellKey(row, col);
                                  final isCenter = row == 2 && col == 2;

                                  return GestureDetector(
                                    onTap: () => _toggleCell(row, col),
                                    child: AnimatedBuilder(
                                      animation: _twistController,
                                      builder: (context, child) {
                                        final isActive = _selectedCells.contains(key);
                                        final animationValue =
                                            isActive ? (math.sin(_twistController.value * math.pi * 2) * 0.2) : 0.0;

                                        return Transform.rotate(
                                          angle: animationValue,
                                          child: Container(
                                            decoration: BoxDecoration(
                                              color: isActive
                                                  ? const Color(0xFFE53935)
                                                  : (isCenter ? Colors.grey.shade200 : Colors.white),
                                              borderRadius: BorderRadius.circular(12),
                                              border: Border.all(
                                                color: isActive ? const Color(0xFFB71C1C) : Colors.grey.shade300,
                                                width: isActive ? 2.5 : 1,
                                              ),
                                              boxShadow: isActive
                                                  ? [
                                                      BoxShadow(
                                                        color: const Color(0xFFE53935).withValues(alpha: 0.4),
                                                        blurRadius: 6,
                                                        offset: const Offset(0, 3),
                                                      ),
                                                    ]
                                                  : [
                                                      BoxShadow(
                                                        color: Colors.black.withValues(alpha: 0.05),
                                                        blurRadius: 2,
                                                        offset: const Offset(0, 1),
                                                      ),
                                                    ],
                                            ),
                                            child: isCenter
                                                ? Center(
                                                    child: Text(
                                                      'FREE',
                                                      style: TextStyle(
                                                        fontWeight: FontWeight.bold,
                                                        color: Colors.grey.shade600,
                                                      ),
                                                    ),
                                                  )
                                                : const SizedBox.shrink(),
                                          ),
                                        );
                                      },
                                    ),
                                  );
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
                if (_showWarnings && _selectedCells.isEmpty) ...[
                  const SizedBox(height: 12),
                  Text(
                    'Select at least one cell to define the custom pattern.',
                    style: TextStyle(color: Theme.of(context).colorScheme.error),
                  ),
                ],
                const SizedBox(height: 24),
                FilledButton.icon(
                  onPressed: _handleSave,
                  icon: const Icon(Icons.save),
                  label: const Text('Save Pattern'),
                  style: FilledButton.styleFrom(
                    minimumSize: const Size.fromHeight(52),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

