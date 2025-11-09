import 'package:cloud_firestore/cloud_firestore.dart';

class CustomPattern {
  final String id;
  final String name;
  final List<String> cells;
  final DateTime? createdAt;
  final String? description;

  CustomPattern({
    required this.id,
    required this.name,
    required this.cells,
    this.description,
    this.createdAt,
  });

  factory CustomPattern.fromFirestoreMap(Map<String, dynamic> map) {
    return CustomPattern(
      id: map['id'] as String,
      name: map['name'] as String,
      cells: (map['cells'] as List<dynamic>).map((e) => e as String).toList(),
      description: map['description'] as String?,
      createdAt: (map['createdAt'] as Timestamp?)?.toDate(),
    );
  }

  factory CustomPattern.fromFirestoreDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data()!;
    return CustomPattern(
      id: doc.id,
      name: data['name'] as String,
      cells: (data['cells'] as List<dynamic>).map((e) => e as String).toList(),
      description: data['description'] as String?,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'cells': cells,
      if (description != null && description!.isNotEmpty) 'description': description,
      if (createdAt != null) 'createdAt': Timestamp.fromDate(createdAt!),
    };
  }
}

