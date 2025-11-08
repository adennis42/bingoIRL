import 'package:cloud_firestore/cloud_firestore.dart';
import 'winning_pattern.dart';

/// Round model for a Bingo game
class Round {
  final int roundNumber;
  final WinningPattern pattern;
  final String? prize;
  final String? winnerId;
  final String? winnerName;
  final DateTime? completedAt;

  Round({
    required this.roundNumber,
    required this.pattern,
    this.prize,
    this.winnerId,
    this.winnerName,
    this.completedAt,
  });

  /// Check if round is completed
  bool get isCompleted => completedAt != null && winnerId != null;

  /// Create from Firestore map
  factory Round.fromFirestore(Map<String, dynamic> map) {
    return Round(
      roundNumber: map['roundNumber'] as int,
      pattern: WinningPattern.fromFirestore(map['pattern'] as String),
      prize: map['prize'] as String?,
      winnerId: map['winnerId'] as String?,
      winnerName: map['winnerName'] as String?,
      completedAt: (map['completedAt'] as Timestamp?)?.toDate(),
    );
  }

  /// Convert to Firestore map
  Map<String, dynamic> toFirestore() {
    return {
      'roundNumber': roundNumber,
      'pattern': pattern.toFirestore(),
      if (prize != null) 'prize': prize,
      if (winnerId != null) 'winnerId': winnerId,
      if (winnerName != null) 'winnerName': winnerName,
      if (completedAt != null) 'completedAt': Timestamp.fromDate(completedAt!),
    };
  }

  /// Create a copy with updated fields
  Round copyWith({
    int? roundNumber,
    WinningPattern? pattern,
    String? prize,
    String? winnerId,
    String? winnerName,
    DateTime? completedAt,
  }) {
    return Round(
      roundNumber: roundNumber ?? this.roundNumber,
      pattern: pattern ?? this.pattern,
      prize: prize ?? this.prize,
      winnerId: winnerId ?? this.winnerId,
      winnerName: winnerName ?? this.winnerName,
      completedAt: completedAt ?? this.completedAt,
    );
  }
}

