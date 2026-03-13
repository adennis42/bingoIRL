import {
  getAllNumbers,
  getColumnColor,
  getColumn,
  getActualNumber,
  formatNumber,
} from "@/lib/utils/bingo";

describe("Bingo Utilities Extended Edge Cases", () => {
  describe("getAllNumbers", () => {
    it("should have no duplicates", () => {
      const numbers = getAllNumbers();
      const unique = new Set(numbers);
      expect(unique.size).toBe(numbers.length);
    });

    it("should have correct first and last numbers", () => {
      const numbers = getAllNumbers();
      expect(numbers[0]).toBe("B1");
      expect(numbers[numbers.length - 1]).toBe("O15");
    });

    it("should have sequential numbers within columns", () => {
      const numbers = getAllNumbers();
      const bNumbers = numbers.filter((n) => n.startsWith("B"));
      
      // B numbers should be B1-B15
      expect(bNumbers[0]).toBe("B1");
      expect(bNumbers[bNumbers.length - 1]).toBe("B15");
    });
  });

  describe("formatNumber", () => {
    it("should handle zero", () => {
      expect(formatNumber(0)).toBe("B0");
    });

    it("should handle numbers beyond 75", () => {
      expect(formatNumber(76)).toBe("O16");
      expect(formatNumber(100)).toBe("O40");
    });

    it("should handle negative numbers", () => {
      // Negative numbers will still format, but may not be valid bingo numbers
      expect(formatNumber(-1)).toBe("B-1");
    });

    it("should handle boundary values between columns", () => {
      expect(formatNumber(15)).toBe("B15"); // Last B
      expect(formatNumber(16)).toBe("I1"); // First I
      expect(formatNumber(30)).toBe("I15"); // Last I
      expect(formatNumber(31)).toBe("N1"); // First N
      expect(formatNumber(45)).toBe("N15"); // Last N
      expect(formatNumber(46)).toBe("G1"); // First G
      expect(formatNumber(60)).toBe("G15"); // Last G
      expect(formatNumber(61)).toBe("O1"); // First O
      expect(formatNumber(75)).toBe("O15"); // Last O
    });
  });

  describe("getActualNumber", () => {
    it("should handle invalid format gracefully", () => {
      expect(getActualNumber("X1")).toBe(0);
      expect(getActualNumber("")).toBe(0);
      expect(getActualNumber("123")).toBe(0);
    });

    it("should handle numbers with leading zeros", () => {
      expect(getActualNumber("B01")).toBe(1);
      expect(getActualNumber("B05")).toBe(5);
    });

    it("should handle single digit numbers", () => {
      expect(getActualNumber("B1")).toBe(1);
      expect(getActualNumber("I1")).toBe(16);
      expect(getActualNumber("N1")).toBe(31);
      expect(getActualNumber("G1")).toBe(46);
      expect(getActualNumber("O1")).toBe(61);
    });

    it("should handle double digit numbers", () => {
      expect(getActualNumber("B15")).toBe(15);
      expect(getActualNumber("I15")).toBe(30);
      expect(getActualNumber("N15")).toBe(45);
      expect(getActualNumber("G15")).toBe(60);
      expect(getActualNumber("O15")).toBe(75);
    });

    it("should handle lowercase column letters", () => {
      // getColumn might not handle lowercase, but getActualNumber should
      expect(getActualNumber("b1")).toBe(1);
      expect(getActualNumber("i1")).toBe(16);
    });
  });

  describe("getColumn", () => {
    it("should handle empty string", () => {
      expect(getColumn("")).toBe("");
    });

    it("should handle single character", () => {
      expect(getColumn("B")).toBe("B");
    });

    it("should handle numbers without column", () => {
      expect(getColumn("123")).toBe("1");
    });

    it("should handle lowercase letters", () => {
      expect(getColumn("b1")).toBe("b");
    });
  });

  describe("getColumnColor", () => {
    it("should return consistent colors", () => {
      const color1 = getColumnColor("B");
      const color2 = getColumnColor("B");
      expect(color1).toBe(color2);
    });

    it("should return different colors for different columns", () => {
      const colors = [
        getColumnColor("B"),
        getColumnColor("I"),
        getColumnColor("N"),
        getColumnColor("G"),
        getColumnColor("O"),
      ];
      
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(5);
    });

    it("should return CSS variable format", () => {
      const color = getColumnColor("B");
      expect(color).toMatch(/^var\(--col-/);
    });
  });
});
