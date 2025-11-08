/// Game status enumeration
enum GameStatus {
  setup,
  active,
  paused,
  ended;

  /// Convert to Firestore string
  String toFirestore() {
    return name;
  }

  /// Create from Firestore string
  static GameStatus fromFirestore(String value) {
    return GameStatus.values.firstWhere(
      (status) => status.name == value,
      orElse: () => GameStatus.setup,
    );
  }

  /// Display name for UI
  String get displayName {
    switch (this) {
      case GameStatus.setup:
        return 'Setup';
      case GameStatus.active:
        return 'Active';
      case GameStatus.paused:
        return 'Paused';
      case GameStatus.ended:
        return 'Ended';
    }
  }
}

