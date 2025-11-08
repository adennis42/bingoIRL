import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../core/constants/app_constants.dart';
import '../../core/constants/bingo_constants.dart';

/// Service for Firestore operations
class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final Random _random = Random();

  /// Get Firestore instance
  FirebaseFirestore get firestore => _firestore;

  /// Generate a random game code (6 alphanumeric characters)
  String generateGameCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    final code = StringBuffer();
    for (int i = 0; i < BingoConstants.gameCodeLength; i++) {
      code.write(chars[_random.nextInt(chars.length)]);
    }
    return code.toString();
  }

  /// Check if game code exists
  Future<bool> gameCodeExists(String gameCode) async {
    try {
      final query = await _firestore
          .collection(AppConstants.gamesCollection)
          .where(AppConstants.fieldGameCode, isEqualTo: gameCode)
          .limit(1)
          .get();
      return query.docs.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  /// Generate a unique game code
  Future<String> generateUniqueGameCode() async {
    String code;
    int attempts = 0;
    do {
      code = generateGameCode();
      final exists = await gameCodeExists(code);
      if (!exists) {
        return code;
      }
      attempts++;
      if (attempts > 10) {
        // Fallback: use timestamp-based code
        code = DateTime.now().millisecondsSinceEpoch.toString().substring(7);
      }
    } while (attempts <= 10);
    return code;
  }

  /// Get user document
  Future<DocumentSnapshot> getUser(String userId) async {
    try {
      return await _firestore
          .collection(AppConstants.usersCollection)
          .doc(userId)
          .get();
    } catch (e) {
      throw Exception('Failed to fetch user data.');
    }
  }

  /// Create or update user document
  Future<void> createOrUpdateUser({
    required String userId,
    required String email,
    String? displayName,
  }) async {
    try {
      final userRef = _firestore.collection(AppConstants.usersCollection).doc(userId);
      final userDoc = await userRef.get();

      if (userDoc.exists) {
        // Update existing user
        await userRef.update({
          'email': email,
          if (displayName != null) 'displayName': displayName,
        });
      } else {
        // Create new user
        await userRef.set({
          'email': email,
          'displayName': displayName ?? '',
          'createdAt': FieldValue.serverTimestamp(),
          'gamesHosted': 0,
        });
      }
    } catch (e) {
      throw Exception('Failed to save user data.');
    }
  }

  /// Increment games hosted count
  Future<void> incrementGamesHosted(String userId) async {
    try {
      await _firestore
          .collection(AppConstants.usersCollection)
          .doc(userId)
          .update({
        'gamesHosted': FieldValue.increment(1),
      });
    } catch (e) {
      // Non-critical error, silently fail
      // Could add logging service here in the future
    }
  }
}

