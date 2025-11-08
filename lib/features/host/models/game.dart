import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../shared/models/game_status.dart';
import '../../../shared/models/round.dart';

/// Game model for a Bingo game
class Game {
  final String id;
  final String hostId;
  final String gameCode;
  final GameStatus status;
  final DateTime createdAt;
  final int currentRound;
  final int totalRounds;
  final List<Round> rounds;

  Game({
    required this.id,
    required this.hostId,
    required this.gameCode,
    required this.status,
    required this.createdAt,
    required this.currentRound,
    required this.totalRounds,
    required this.rounds,
  });

  /// Get current round object
  Round? get currentRoundObject {
    if (currentRound > 0 && currentRound <= rounds.length) {
      return rounds[currentRound - 1];
    }
    return null;
  }

  /// Check if game is active
  bool get isActive => status == GameStatus.active;

  /// Check if game is ended
  bool get isEnded => status == GameStatus.ended;

  /// Create from Firestore document
  factory Game.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    final roundsData = data['rounds'] as List<dynamic>? ?? [];
    
    return Game(
      id: doc.id,
      hostId: data['hostId'] as String,
      gameCode: data['gameCode'] as String,
      status: GameStatus.fromFirestore(data['status'] as String),
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      currentRound: data['currentRound'] as int? ?? 0,
      totalRounds: data['totalRounds'] as int,
      rounds: roundsData
          .map((r) => Round.fromFirestore(r as Map<String, dynamic>))
          .toList(),
    );
  }

  /// Convert to Firestore map
  Map<String, dynamic> toFirestore() {
    return {
      'hostId': hostId,
      'gameCode': gameCode,
      'status': status.toFirestore(),
      'createdAt': Timestamp.fromDate(createdAt),
      'currentRound': currentRound,
      'totalRounds': totalRounds,
      'rounds': rounds.map((r) => r.toFirestore()).toList(),
    };
  }

  /// Create a copy with updated fields
  Game copyWith({
    String? id,
    String? hostId,
    String? gameCode,
    GameStatus? status,
    DateTime? createdAt,
    int? currentRound,
    int? totalRounds,
    List<Round>? rounds,
  }) {
    return Game(
      id: id ?? this.id,
      hostId: hostId ?? this.hostId,
      gameCode: gameCode ?? this.gameCode,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      currentRound: currentRound ?? this.currentRound,
      totalRounds: totalRounds ?? this.totalRounds,
      rounds: rounds ?? this.rounds,
    );
  }
}

