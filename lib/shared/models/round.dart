import 'package:cloud_firestore/cloud_firestore.dart';
import 'winning_pattern.dart';
import 'custom_pattern.dart';

/// Round model for a Bingo game
class Round {
  final int roundNumber;
  final WinningPattern? pattern;
  final CustomPattern? customPattern;
  final String? prize;
  final String? winnerId;
  final String? winnerName;
  final DateTime? completedAt;

  Round({
    required this.roundNumber,
    this.pattern,
    this.customPattern,
    this.prize,
    this.winnerId,
    this.winnerName,
    this.completedAt,
  }) : assert(pattern != null || customPattern != null,
            'Either pattern or customPattern must be provided.');

  /// Check if round is completed
  bool get isCompleted => completedAt != null && winnerId != null;

  bool get isCustomPattern => customPattern != null;

  /// Create from Firestore map
  factory Round.fromFirestore(Map<String, dynamic> map) {
    CustomPattern? custom;
    WinningPattern? builtIn;

    if (map['customPattern'] != null) {
      final customMap = map['customPattern'] as Map<String, dynamic>;
      custom = CustomPattern.fromFirestoreMap(customMap);
    }

    if (map['pattern'] != null) {
      builtIn = WinningPattern.fromFirestore(map['pattern'] as String);
    }

    return Round(
      roundNumber: map['roundNumber'] as int,
      pattern: builtIn,
      customPattern: custom,
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
      if (pattern != null) 'pattern': pattern!.toFirestore(),
      if (customPattern != null)
        'customPattern': {
          'id': customPattern!.id,
          ...customPattern!.toFirestore(),
        },
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
    CustomPattern? customPattern,
    String? prize,
    String? winnerId,
    String? winnerName,
    DateTime? completedAt,
  }) {
    return Round(
      roundNumber: roundNumber ?? this.roundNumber,
      pattern: pattern ?? this.pattern,
      customPattern: customPattern ?? this.customPattern,
      prize: prize ?? this.prize,
      winnerId: winnerId ?? this.winnerId,
      winnerName: winnerName ?? this.winnerName,
      completedAt: completedAt ?? this.completedAt,
    );
  }
}

