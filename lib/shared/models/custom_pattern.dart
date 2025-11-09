class CustomPattern {
  final String id;
  final String name;
  final List<String> cells;

  CustomPattern({
    required this.id,
    required this.name,
    required this.cells,
  });

  factory CustomPattern.fromFirestore(Map<String, dynamic> map) {
    return CustomPattern(
      id: map['id'] as String,
      name: map['name'] as String,
      cells: (map['cells'] as List<dynamic>).map((e) => e as String).toList(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'id': id,
      'name': name,
      'cells': cells,
    };
  }
}

