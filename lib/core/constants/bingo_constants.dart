/// Constants for Bingo game mechanics
class BingoConstants {
  // Bingo column ranges
  static const int bMin = 1;
  static const int bMax = 15;
  static const int iMin = 16;
  static const int iMax = 30;
  static const int nMin = 31;
  static const int nMax = 45;
  static const int gMin = 46;
  static const int gMax = 60;
  static const int oMin = 61;
  static const int oMax = 75;

  // Bingo column letters
  static const List<String> columns = ['B', 'I', 'N', 'G', 'O'];

  // Total numbers in Bingo
  static const int totalNumbers = 75;

  // Game code length
  static const int gameCodeLength = 6;

  // Min/Max rounds
  static const int minRounds = 1;
  static const int maxRounds = 10;

  /// Get the column letter for a given number (1-75)
  static String getColumnForNumber(int number) {
    if (number >= bMin && number <= bMax) return 'B';
    if (number >= iMin && number <= iMax) return 'I';
    if (number >= nMin && number <= nMax) return 'N';
    if (number >= gMin && number <= gMax) return 'G';
    if (number >= oMin && number <= oMax) return 'O';
    throw ArgumentError('Number $number is out of valid range (1-75)');
  }

  /// Format a number as Bingo notation (e.g., 7 -> "B7")
  static String formatBingoNumber(int number) {
    return '${getColumnForNumber(number)}$number';
  }

  /// Parse a Bingo number string (e.g., "B7" -> 7)
  static int parseBingoNumber(String bingoNumber) {
    if (bingoNumber.length < 2) {
      throw ArgumentError('Invalid bingo number format: $bingoNumber');
    }
    // Skip the column letter (first character) and parse the number
    final number = int.tryParse(bingoNumber.substring(1));
    if (number == null) {
      throw ArgumentError('Invalid bingo number format: $bingoNumber');
    }
    return number;
  }

  /// Get all numbers for a column
  static List<int> getNumbersForColumn(String columnLetter) {
    switch (columnLetter.toUpperCase()) {
      case 'B':
        return List.generate(bMax - bMin + 1, (i) => bMin + i);
      case 'I':
        return List.generate(iMax - iMin + 1, (i) => iMin + i);
      case 'N':
        return List.generate(nMax - nMin + 1, (i) => nMin + i);
      case 'G':
        return List.generate(gMax - gMin + 1, (i) => gMin + i);
      case 'O':
        return List.generate(oMax - oMin + 1, (i) => oMin + i);
      default:
        throw ArgumentError('Invalid column: $columnLetter');
    }
  }

  /// Generate all Bingo numbers (1-75)
  static List<String> getAllBingoNumbers() {
    return List.generate(totalNumbers, (i) => formatBingoNumber(i + 1));
  }
}

