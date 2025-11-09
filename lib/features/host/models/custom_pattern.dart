import 'package:cloud_firestore/cloud_firestore.dart';

class CustomPatternDraft {
  CustomPatternDraft({
    required this.name,
    this.description = '',
    Set<String>? selectedCells,
  }) : selectedCells = selectedCells ?? <String>{};

  String name;
  String description;
  final Set<String> selectedCells;

  bool get hasSelection => selectedCells.isNotEmpty;

  List<String> get cellsAsList {
    final list = selectedCells.toList();
    list.sort();
    return list;
  }

  CustomPatternDraft copyWith({
    String? name,
    String? description,
    Set<String>? selectedCells,
  }) {
    return CustomPatternDraft(
      name: name ?? this.name,
      description: description ?? this.description,
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

  Map<String, dynamic> toFirestoreMap() {
    final desc = description.trim();
    return {
      'name': name,
      'cells': cellsAsList,
      if (desc.isNotEmpty) 'description': desc,
      'createdAt': FieldValue.serverTimestamp(),
    };
  }
}

