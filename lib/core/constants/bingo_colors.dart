import 'package:flutter/material.dart';

/// Traditional Bingo column colors
class BingoColors {
  // Traditional Bingo column colors
  static const Color bColumnColor = Color(0xFF1E88E5); // Blue
  static const Color iColumnColor = Color(0xFFE0E0E0); // Light Gray/White
  static const Color nColumnColor = Color(0xFF4CAF50); // Green
  static const Color gColumnColor = Color(0xFFFFC107); // Amber/Yellow
  static const Color oColumnColor = Color(0xFFE53935); // Red

  // Text colors for readability
  static const Color bColumnTextColor = Colors.white;
  static const Color iColumnTextColor = Color(0xFF212121); // Dark gray for contrast
  static const Color nColumnTextColor = Colors.white;
  static const Color gColumnTextColor = Color(0xFF212121); // Dark gray for contrast
  static const Color oColumnTextColor = Colors.white;

  // Called number colors (darker/more muted versions)
  static const Color bColumnCalledColor = Color(0xFF1565C0); // Darker blue
  static const Color iColumnCalledColor = Color(0xFFBDBDBD); // Darker gray
  static const Color nColumnCalledColor = Color(0xFF388E3C); // Darker green
  static const Color gColumnCalledColor = Color(0xFFF9A825); // Darker amber
  static const Color oColumnCalledColor = Color(0xFFC62828); // Darker red

  /// Get the background color for a column letter
  static Color getColumnColor(String column, {bool isCalled = false}) {
    switch (column.toUpperCase()) {
      case 'B':
        return isCalled ? bColumnCalledColor : bColumnColor;
      case 'I':
        return isCalled ? iColumnCalledColor : iColumnColor;
      case 'N':
        return isCalled ? nColumnCalledColor : nColumnColor;
      case 'G':
        return isCalled ? gColumnCalledColor : gColumnColor;
      case 'O':
        return isCalled ? oColumnCalledColor : oColumnColor;
      default:
        return Colors.grey;
    }
  }

  /// Get the text color for a column letter
  static Color getColumnTextColor(String column, {bool isCalled = false}) {
    switch (column.toUpperCase()) {
      case 'B':
        return bColumnTextColor;
      case 'I':
        return iColumnTextColor;
      case 'N':
        return nColumnTextColor;
      case 'G':
        return gColumnTextColor;
      case 'O':
        return oColumnTextColor;
      default:
        return Colors.black;
    }
  }

  /// Get border color for a column (for better visual separation)
  static Color getColumnBorderColor(String column) {
    switch (column.toUpperCase()) {
      case 'B':
        return const Color(0xFF0D47A1); // Dark blue border
      case 'I':
        return const Color(0xFF9E9E9E); // Gray border
      case 'N':
        return const Color(0xFF1B5E20); // Dark green border
      case 'G':
        return const Color(0xFFF57F17); // Dark amber border
      case 'O':
        return const Color(0xFFB71C1C); // Dark red border
      default:
        return Colors.grey;
    }
  }
}

