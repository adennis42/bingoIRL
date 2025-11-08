import 'package:cloud_firestore/cloud_firestore.dart';
import '../../core/constants/app_constants.dart';
import '../../shared/models/game_status.dart';
import '../../shared/models/round.dart';
import '../../shared/models/called_number.dart';
import 'firestore_service.dart';
import '../../features/host/models/game.dart';
import '../../features/player/models/player.dart';

/// Service for game operations
class GameService {
  final FirestoreService _firestoreService = FirestoreService();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// Create a new game
  Future<Game> createGame({
    required String hostId,
    required int totalRounds,
    required List<Round> rounds,
  }) async {
    try {
      final gameCode = await _firestoreService.generateUniqueGameCode();
      
      final gameRef = _firestore.collection(AppConstants.gamesCollection).doc();
      
      final gameData = {
        'hostId': hostId,
        'gameCode': gameCode,
        'status': GameStatus.setup.toFirestore(),
        'createdAt': FieldValue.serverTimestamp(),
        'currentRound': 0,
        'totalRounds': totalRounds,
        'rounds': rounds.map((r) => r.toFirestore()).toList(),
      };

      await gameRef.set(gameData);

      // Increment games hosted count
      await _firestoreService.incrementGamesHosted(hostId);

      // Fetch and return the created game
      final doc = await gameRef.get();
      return Game.fromFirestore(doc);
    } catch (e) {
      throw Exception('Failed to create game: ${e.toString()}');
    }
  }

  /// Get game by ID
  Future<Game?> getGame(String gameId) async {
    try {
      final doc = await _firestore
          .collection(AppConstants.gamesCollection)
          .doc(gameId)
          .get();
      
      if (!doc.exists) {
        return null;
      }
      
      return Game.fromFirestore(doc);
    } catch (e) {
      throw Exception('Failed to fetch game: ${e.toString()}');
    }
  }

  /// Get game by game code
  Future<Game?> getGameByCode(String gameCode) async {
    try {
      final query = await _firestore
          .collection(AppConstants.gamesCollection)
          .where(AppConstants.fieldGameCode, isEqualTo: gameCode)
          .limit(1)
          .get();
      
      if (query.docs.isEmpty) {
        return null;
      }
      
      return Game.fromFirestore(query.docs.first);
    } catch (e) {
      throw Exception('Failed to fetch game: ${e.toString()}');
    }
  }

  /// Stream game updates
  Stream<Game?> streamGame(String gameId) {
    return _firestore
        .collection(AppConstants.gamesCollection)
        .doc(gameId)
        .snapshots()
        .map((doc) {
      if (!doc.exists) {
        return null;
      }
      return Game.fromFirestore(doc);
    });
  }

  /// Update game status
  Future<void> updateGameStatus(String gameId, GameStatus status) async {
    try {
      await _firestore
          .collection(AppConstants.gamesCollection)
          .doc(gameId)
          .update({
        'status': status.toFirestore(),
      });
    } catch (e) {
      throw Exception('Failed to update game status: ${e.toString()}');
    }
  }

  /// Start game
  Future<void> startGame(String gameId) async {
    try {
      await _firestore
          .collection(AppConstants.gamesCollection)
          .doc(gameId)
          .update({
        'status': GameStatus.active.toFirestore(),
        'currentRound': 1,
      });
    } catch (e) {
      throw Exception('Failed to start game: ${e.toString()}');
    }
  }

  /// Call a number
  Future<void> callNumber({
    required String gameId,
    required String number, // Format: "B7"
    required int sequence,
  }) async {
    try {
      await _firestore
          .collection(AppConstants.gamesCollection)
          .doc(gameId)
          .collection(AppConstants.calledNumbersCollection)
          .add({
        'number': number,
        'calledAt': FieldValue.serverTimestamp(),
        'sequence': sequence,
      });
    } catch (e) {
      throw Exception('Failed to call number: ${e.toString()}');
    }
  }

  /// Get called numbers for a game
  Stream<List<CalledNumber>> streamCalledNumbers(String gameId) {
    return _firestore
        .collection(AppConstants.gamesCollection)
        .doc(gameId)
        .collection(AppConstants.calledNumbersCollection)
        .orderBy('sequence', descending: false)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs
          .map((doc) => CalledNumber.fromFirestoreDoc(doc))
          .toList();
    });
  }

  /// Get last called number
  Future<CalledNumber?> getLastCalledNumber(String gameId) async {
    try {
      final query = await _firestore
          .collection(AppConstants.gamesCollection)
          .doc(gameId)
          .collection(AppConstants.calledNumbersCollection)
          .orderBy('sequence', descending: true)
          .limit(1)
          .get();
      
      if (query.docs.isEmpty) {
        return null;
      }
      
      return CalledNumber.fromFirestoreDoc(query.docs.first);
    } catch (e) {
      return null;
    }
  }

  /// Undo last called number
  Future<void> undoLastCalledNumber(String gameId) async {
    try {
      final query = await _firestore
          .collection(AppConstants.gamesCollection)
          .doc(gameId)
          .collection(AppConstants.calledNumbersCollection)
          .orderBy('sequence', descending: true)
          .limit(1)
          .get();
      
      if (query.docs.isEmpty) {
        throw Exception('No numbers to undo.');
      }
      
      await query.docs.first.reference.delete();
    } catch (e) {
      throw Exception('Failed to undo last number: ${e.toString()}');
    }
  }

  /// Mark winner for current round
  Future<void> markWinner({
    required String gameId,
    required int roundNumber,
    required String winnerId,
    required String winnerName,
  }) async {
    try {
      final game = await getGame(gameId);
      if (game == null) {
        throw Exception('Game not found.');
      }

      final updatedRounds = List<Round>.from(game.rounds);
      if (roundNumber > 0 && roundNumber <= updatedRounds.length) {
        updatedRounds[roundNumber - 1] = updatedRounds[roundNumber - 1].copyWith(
          winnerId: winnerId,
          winnerName: winnerName,
          completedAt: DateTime.now(),
        );
      }

      final nextRound = roundNumber < game.totalRounds ? roundNumber + 1 : roundNumber;
      final newStatus = nextRound > game.totalRounds 
          ? GameStatus.ended 
          : game.status;

      await _firestore
          .collection(AppConstants.gamesCollection)
          .doc(gameId)
          .update({
        'rounds': updatedRounds.map((r) => r.toFirestore()).toList(),
        'currentRound': nextRound,
        if (newStatus != game.status) 'status': newStatus.toFirestore(),
      });
    } catch (e) {
      throw Exception('Failed to mark winner: ${e.toString()}');
    }
  }

  /// Advance to next round
  Future<void> advanceToNextRound(String gameId) async {
    try {
      final game = await getGame(gameId);
      if (game == null) {
        throw Exception('Game not found.');
      }

      if (game.currentRound >= game.totalRounds) {
        await updateGameStatus(gameId, GameStatus.ended);
        return;
      }

      await _firestore
          .collection(AppConstants.gamesCollection)
          .doc(gameId)
          .update({
        'currentRound': game.currentRound + 1,
      });
    } catch (e) {
      throw Exception('Failed to advance round: ${e.toString()}');
    }
  }

  /// Join game as player
  Future<void> joinGame({
    required String gameId,
    required String playerId,
    String? displayName,
  }) async {
    try {
      await _firestore
          .collection(AppConstants.gamesCollection)
          .doc(gameId)
          .collection(AppConstants.playersCollection)
          .doc(playerId)
          .set({
        if (displayName != null) 'displayName': displayName,
        'joinedAt': FieldValue.serverTimestamp(),
        'isActive': true,
      });
    } catch (e) {
      throw Exception('Failed to join game: ${e.toString()}');
    }
  }

  /// Get players for a game
  Stream<List<Player>> streamPlayers(String gameId) {
    return _firestore
        .collection(AppConstants.gamesCollection)
        .doc(gameId)
        .collection(AppConstants.playersCollection)
        .where('isActive', isEqualTo: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs
          .map((doc) => Player.fromFirestore(doc))
          .toList();
    });
  }

  /// Get player count
  Future<int> getPlayerCount(String gameId) async {
    try {
      final query = await _firestore
          .collection(AppConstants.gamesCollection)
          .doc(gameId)
          .collection(AppConstants.playersCollection)
          .where('isActive', isEqualTo: true)
          .get();
      
      return query.docs.length;
    } catch (e) {
      return 0;
    }
  }

  /// End game
  Future<void> endGame(String gameId) async {
    try {
      await updateGameStatus(gameId, GameStatus.ended);
    } catch (e) {
      throw Exception('Failed to end game: ${e.toString()}');
    }
  }

  /// Get games hosted by user
  Stream<List<Game>> streamHostedGames(String hostId) {
    return _firestore
        .collection(AppConstants.gamesCollection)
        .where('hostId', isEqualTo: hostId)
        .snapshots()
        .map((snapshot) {
      final games = snapshot.docs
          .map((doc) => Game.fromFirestore(doc))
          .toList();
      
      // Sort by createdAt in descending order (newest first)
      // This is a temporary workaround while the index is building
      games.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      
      return games;
    });
  }
}

