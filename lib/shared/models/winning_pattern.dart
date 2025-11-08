/// Winning pattern enumeration
enum WinningPattern {
  traditionalLine,
  fourCorners,
  blackout;

  /// Convert to Firestore string
  String toFirestore() {
    return name;
  }

  /// Create from Firestore string
  static WinningPattern fromFirestore(String value) {
    return WinningPattern.values.firstWhere(
      (pattern) => pattern.name == value,
      orElse: () => WinningPattern.traditionalLine,
    );
  }

  /// Display name for UI
  String get displayName {
    switch (this) {
      case WinningPattern.traditionalLine:
        return 'Traditional Line';
      case WinningPattern.fourCorners:
        return 'Four Corners';
      case WinningPattern.blackout:
        return 'Blackout';
    }
  }

  /// Description for UI
  String get description {
    switch (this) {
      case WinningPattern.traditionalLine:
        return 'Any horizontal, vertical, or diagonal line';
      case WinningPattern.fourCorners:
        return 'All four corner squares';
      case WinningPattern.blackout:
        return 'All squares on the card';
    }
  }
}

