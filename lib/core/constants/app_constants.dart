/// Application-wide constants
class AppConstants {
  // App information
  static const String appName = 'Bingo Host';
  static const String appVersion = '1.0.0';

  // Firebase collections
  static const String gamesCollection = 'games';
  static const String usersCollection = 'users';
  static const String calledNumbersCollection = 'calledNumbers';
  static const String playersCollection = 'players';

  // Firestore field names
  static const String fieldHostId = 'hostId';
  static const String fieldGameCode = 'gameCode';
  static const String fieldStatus = 'status';
  static const String fieldCreatedAt = 'createdAt';
  static const String fieldCurrentRound = 'currentRound';
  static const String fieldTotalRounds = 'totalRounds';
  static const String fieldRounds = 'rounds';
  static const String fieldCalledNumbers = 'calledNumbers';

  // Error messages
  static const String errorNetwork = 'Network error. Please check your connection.';
  static const String errorInvalidCredentials = 'Invalid email or password.';
  static const String errorEmailInUse = 'This email is already registered.';
  static const String errorWeakPassword = 'Password should be at least 8 characters.';
  static const String errorGameNotFound = 'Game not found. Please check the game code.';
  static const String errorGameExpired = 'This game has ended.';
  static const String errorInvalidGameCode = 'Invalid game code format.';

  // Success messages
  static const String successGameCreated = 'Game created successfully!';
  static const String successNumberCalled = 'Number called successfully!';
  static const String successWinnerMarked = 'Winner marked successfully!';

  // UI constants
  static const double defaultPadding = 16.0;
  static const double defaultBorderRadius = 8.0;
  static const double buttonHeight = 48.0;
}

