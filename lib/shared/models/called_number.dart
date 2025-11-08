import 'package:cloud_firestore/cloud_firestore.dart';

/// Called number model for a Bingo game
class CalledNumber {
  final String number; // Format: "B7", "I23", etc.
  final DateTime calledAt;
  final int sequence; // Order in which it was called (1-75)

  CalledNumber({
    required this.number,
    required this.calledAt,
    required this.sequence,
  });

  /// Create from Firestore map
  factory CalledNumber.fromFirestore(Map<String, dynamic> map, String id) {
    return CalledNumber(
      number: map['number'] as String,
      calledAt: (map['calledAt'] as Timestamp).toDate(),
      sequence: map['sequence'] as int,
    );
  }

  /// Convert to Firestore map
  Map<String, dynamic> toFirestore() {
    return {
      'number': number,
      'calledAt': Timestamp.fromDate(calledAt),
      'sequence': sequence,
    };
  }

  /// Create from Firestore document snapshot
  factory CalledNumber.fromFirestoreDoc(DocumentSnapshot doc) {
    return CalledNumber.fromFirestore(
      doc.data() as Map<String, dynamic>,
      doc.id,
    );
  }
}

