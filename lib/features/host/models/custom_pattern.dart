import '../../../shared/models/custom_pattern.dart';

class CustomPatternDraft {
  CustomPatternDraft({
    required this.name,
    Set<String>? selectedCells,
  }) : selectedCells = selectedCells ?? <String>{};

  String name;
  final Set<String> selectedCells;

  bool get hasSelection => selectedCells.isNotEmpty;

  List<String> get cellsAsList => selectedCells.toList()..sort();

  CustomPatternDraft copyWith({
    String? name,
    Set<String>? selectedCells,
  }) {
    return CustomPatternDraft(
      name: name ?? this.name,
      selectedCells: selectedCells ?? Set<String>.from(this.selectedCells),
    );
  }

  void toggleCell(int row, int col) {
    final key = _cellKey(row, col);
    if (selectedCells.contains(key)) {
      selectedCells.remove(key);
    } else {
      selectedCells.add(key);
    }
  }

  static String _cellKey(int row, int col) => '$row,$col';

  static bool cellSelected(Set<String> cells, int row, int col) {
    return cells.contains(_cellKey(row, col));
  }

  static String keyForCell(int row, int col) => _cellKey(row, col);

  CustomPattern toCustomPattern() {
    return CustomPattern(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      cells: cellsAsList,
    );
  }
}

