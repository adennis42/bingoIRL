import 'package:cloud_firestore/cloud_firestore.dart';

/// Player model for a Bingo game
class Player {
  final String id;
  final String? displayName;
  final DateTime joinedAt;
  final bool isActive;

  Player({
    required this.id,
    this.displayName,
    required this.joinedAt,
    this.isActive = true,
  });

  /// Create from Firestore document
  factory Player.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Player(
      id: doc.id,
      displayName: data['displayName'] as String?,
      joinedAt: (data['joinedAt'] as Timestamp).toDate(),
      isActive: data['isActive'] as bool? ?? true,
    );
  }

  /// Convert to Firestore map
  Map<String, dynamic> toFirestore() {
    return {
      if (displayName != null) 'displayName': displayName,
      'joinedAt': Timestamp.fromDate(joinedAt),
      'isActive': isActive,
    };
  }
}

