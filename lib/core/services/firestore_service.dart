import 'dart:math';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';

import '../../core/constants/app_constants.dart';
import '../../core/constants/bingo_constants.dart';
import '../../shared/models/custom_pattern.dart';
import '../../features/host/models/custom_pattern.dart' as draft;

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

  /// Fetch custom patterns for a host
  Future<List<CustomPattern>> fetchCustomPatterns(String userId) async {
    try {
      if (kDebugMode) {
        debugPrint('Fetching custom patterns for user: $userId');
      }

      final snapshot = await _firestore
          .collection(AppConstants.usersCollection)
          .doc(userId)
          .collection(AppConstants.customPatternsCollection)
          .orderBy('createdAt', descending: true)
          .get();

      return snapshot.docs
          .map((doc) => CustomPattern.fromFirestoreDoc(doc))
          .toList();
    } on FirebaseException catch (e, stack) {
      if (kDebugMode) {
        debugPrint('fetchCustomPatterns failed: code=${e.code}, message=${e.message}');
        debugPrint(stack.toString());
      }
      throw Exception('Failed to load custom patterns: ${e.message ?? e.code}');
    } catch (e, stack) {
      if (kDebugMode) {
        debugPrint('fetchCustomPatterns unexpected error: $e');
        debugPrint(stack.toString());
      }
      throw Exception('Failed to load custom patterns.');
    }
  }

  /// Create a custom pattern for a host
  Future<CustomPattern> createCustomPattern({
    required String userId,
    required draft.CustomPatternDraft draftPattern,
  }) async {
    try {
      if (kDebugMode) {
        debugPrint(
            'Creating custom pattern "${draftPattern.name}" with ${draftPattern.selectedCells.length} cells for $userId');
      }

      final collectionRef = _firestore
          .collection(AppConstants.usersCollection)
          .doc(userId)
          .collection(AppConstants.customPatternsCollection);

      final docRef = collectionRef.doc();
      await docRef.set(draftPattern.toFirestoreMap());

      final snapshot = await docRef.get();
      return CustomPattern.fromFirestoreDoc(snapshot);
    } on FirebaseException catch (e, stack) {
      if (kDebugMode) {
        debugPrint(
            'createCustomPattern failed: code=${e.code}, message=${e.message}');
        debugPrint(stack.toString());
      }
      throw Exception('Failed to create custom pattern: ${e.message ?? e.code}');
    } catch (e, stack) {
      if (kDebugMode) {
        debugPrint('createCustomPattern unexpected error: $e');
        debugPrint(stack.toString());
      }
      throw Exception('Failed to create custom pattern.');
    }
  }

  /// Delete a custom pattern for a host
  Future<void> deleteCustomPattern({
    required String userId,
    required String patternId,
  }) async {
    try {
      if (kDebugMode) {
        debugPrint('Deleting custom pattern "$patternId" for user: $userId');
      }

      await _firestore
          .collection(AppConstants.usersCollection)
          .doc(userId)
          .collection(AppConstants.customPatternsCollection)
          .doc(patternId)
          .delete();
    } on FirebaseException catch (e, stack) {
      if (kDebugMode) {
        debugPrint('deleteCustomPattern failed: code=${e.code}, message=${e.message}');
        debugPrint(stack.toString());
      }
      throw Exception('Failed to delete custom pattern: ${e.message ?? e.code}');
    } catch (e, stack) {
      if (kDebugMode) {
        debugPrint('deleteCustomPattern unexpected error: $e');
        debugPrint(stack.toString());
      }
      throw Exception('Failed to delete custom pattern.');
    }
  }
}

