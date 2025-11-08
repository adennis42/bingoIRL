import 'package:firebase_auth/firebase_auth.dart';
import '../../core/constants/app_constants.dart';

/// Service for handling authentication
class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  /// Get current user
  User? get currentUser => _auth.currentUser;

  /// Get current user ID
  String? get currentUserId => _auth.currentUser?.uid;

  /// Stream of authentication state changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Check if user is signed in
  bool get isSignedIn => _auth.currentUser != null;

  /// Sign in with email and password
  Future<UserCredential> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
    } on FirebaseAuthException catch (e) {
      if (e.code == 'user-not-found' || e.code == 'wrong-password') {
        throw Exception(AppConstants.errorInvalidCredentials);
      } else if (e.code == 'invalid-email') {
        throw Exception('Invalid email format.');
      } else {
        throw Exception(e.message ?? 'Authentication failed.');
      }
    } catch (e) {
      throw Exception(AppConstants.errorNetwork);
    }
  }

  /// Register with email and password
  Future<UserCredential> registerWithEmailAndPassword({
    required String email,
    required String password,
    required String displayName,
  }) async {
    try {
      if (password.length < 8) {
        throw Exception(AppConstants.errorWeakPassword);
      }

      final userCredential = await _auth.createUserWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );

      // Update display name
      await userCredential.user?.updateDisplayName(displayName);

      return userCredential;
    } on FirebaseAuthException catch (e) {
      if (e.code == 'email-already-in-use') {
        throw Exception(AppConstants.errorEmailInUse);
      } else if (e.code == 'weak-password') {
        throw Exception(AppConstants.errorWeakPassword);
      } else if (e.code == 'invalid-email') {
        throw Exception('Invalid email format.');
      } else {
        throw Exception(e.message ?? 'Registration failed.');
      }
    } catch (e) {
      if (e.toString().contains(AppConstants.errorWeakPassword)) {
        rethrow;
      }
      throw Exception(AppConstants.errorNetwork);
    }
  }

  /// Sign in anonymously (for players)
  Future<UserCredential> signInAnonymously() async {
    try {
      return await _auth.signInAnonymously();
    } catch (e) {
      throw Exception(AppConstants.errorNetwork);
    }
  }

  /// Sign out
  Future<void> signOut() async {
    try {
      await _auth.signOut();
    } catch (e) {
      throw Exception('Sign out failed. Please try again.');
    }
  }

  /// Reset password
  Future<void> resetPassword(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email.trim());
    } on FirebaseAuthException catch (e) {
      if (e.code == 'user-not-found') {
        throw Exception('No account found with this email.');
      } else {
        throw Exception(e.message ?? 'Password reset failed.');
      }
    } catch (e) {
      throw Exception(AppConstants.errorNetwork);
    }
  }

  /// Update display name
  Future<void> updateDisplayName(String displayName) async {
    try {
      await currentUser?.updateDisplayName(displayName);
      await currentUser?.reload();
    } catch (e) {
      throw Exception('Failed to update display name.');
    }
  }
}

