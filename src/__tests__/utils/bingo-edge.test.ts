import {
  getActualNumber,
  formatNumber,
  getColumnColor,
} from "@/lib/utils/bingo";

describe("Bingo Utilities Edge Cases", () => {
  describe("getActualNumber", () => {
    it("should handle invalid column", () => {
      expect(getActualNumber("X1")).toBe(0);
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
  });

  describe("formatNumber", () => {
    it("should handle boundary values", () => {
      expect(formatNumber(1)).toBe("B1");
      expect(formatNumber(15)).toBe("B15");
      expect(formatNumber(16)).toBe("I1");
      expect(formatNumber(30)).toBe("I15");
      expect(formatNumber(31)).toBe("N1");
      expect(formatNumber(45)).toBe("N15");
      expect(formatNumber(46)).toBe("G1");
      expect(formatNumber(60)).toBe("G15");
      expect(formatNumber(61)).toBe("O1");
      expect(formatNumber(75)).toBe("O15");
    });

    it("should handle edge cases", () => {
      expect(formatNumber(0)).toBe("B0");
      expect(formatNumber(76)).toBe("O16");
    });
  });

  describe("getColumnColor", () => {
    it("should return color for each column", () => {
      const colors = {
        B: getColumnColor("B"),
        I: getColumnColor("I"),
        N: getColumnColor("N"),
        G: getColumnColor("G"),
        O: getColumnColor("O"),
      };

      expect(colors.B).toBeTruthy();
      expect(colors.I).toBeTruthy();
      expect(colors.N).toBeTruthy();
      expect(colors.G).toBeTruthy();
      expect(colors.O).toBeTruthy();

      // All should be CSS variables
      expect(colors.B).toMatch(/^var\(--col-/);
      expect(colors.I).toMatch(/^var\(--col-/);
      expect(colors.N).toMatch(/^var\(--col-/);
      expect(colors.G).toMatch(/^var\(--col-/);
      expect(colors.O).toMatch(/^var\(--col-/);
    });
  });
});
