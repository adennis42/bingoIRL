import {
  getAllNumbers,
  getColumnColor,
  getColumn,
  getActualNumber,
  formatNumber,
} from "@/lib/utils/bingo";
import type { BingoColumn } from "@/types";

describe("Bingo Utilities", () => {
  describe("getAllNumbers", () => {
    it("should return all 75 bingo numbers", () => {
      const numbers = getAllNumbers();
      expect(numbers).toHaveLength(75);
      expect(numbers[0]).toBe("B1");
      expect(numbers[74]).toBe("O15"); // Last number is O15 (75 - 60 = 15)
    });

    it("should have correct column distribution", () => {
      const numbers = getAllNumbers();
      const bNumbers = numbers.filter((n) => n.startsWith("B"));
      const iNumbers = numbers.filter((n) => n.startsWith("I"));
      const nNumbers = numbers.filter((n) => n.startsWith("N"));
      const gNumbers = numbers.filter((n) => n.startsWith("G"));
      const oNumbers = numbers.filter((n) => n.startsWith("O"));

      expect(bNumbers).toHaveLength(15);
      expect(iNumbers).toHaveLength(15);
      expect(nNumbers).toHaveLength(15);
      expect(gNumbers).toHaveLength(15);
      expect(oNumbers).toHaveLength(15);
    });
  });

  describe("getColumn", () => {
    it("should return correct column for B numbers", () => {
      expect(getColumn("B1")).toBe("B");
      expect(getColumn("B15")).toBe("B");
    });

    it("should return correct column for I numbers", () => {
      expect(getColumn("I1")).toBe("I");
      expect(getColumn("I15")).toBe("I");
    });

    it("should return correct column for N numbers", () => {
      expect(getColumn("N1")).toBe("N");
      expect(getColumn("N15")).toBe("N");
    });

    it("should return correct column for G numbers", () => {
      expect(getColumn("G1")).toBe("G");
      expect(getColumn("G15")).toBe("G");
    });

    it("should return correct column for O numbers", () => {
      expect(getColumn("O1")).toBe("O");
      expect(getColumn("O15")).toBe("O");
    });
  });

  describe("formatNumber", () => {
    it("should format numbers correctly", () => {
      expect(formatNumber(1)).toBe("B1");
      expect(formatNumber(15)).toBe("B15");
      expect(formatNumber(16)).toBe("I1"); // I column uses 1-15 relative
      expect(formatNumber(30)).toBe("I15");
      expect(formatNumber(31)).toBe("N1"); // N column uses 1-15 relative
      expect(formatNumber(45)).toBe("N15");
      expect(formatNumber(46)).toBe("G1"); // G column uses 1-15 relative
      expect(formatNumber(60)).toBe("G15");
      expect(formatNumber(61)).toBe("O1"); // O column uses 1-15 relative
      expect(formatNumber(75)).toBe("O15");
    });
  });

  describe("getActualNumber", () => {
    it("should convert B numbers correctly", () => {
      expect(getActualNumber("B1")).toBe(1);
      expect(getActualNumber("B15")).toBe(15);
    });

    it("should convert I numbers correctly", () => {
      expect(getActualNumber("I1")).toBe(16); // I1 = 1 + 15 = 16
      expect(getActualNumber("I15")).toBe(30); // I15 = 15 + 15 = 30
    });

    it("should convert N numbers correctly", () => {
      expect(getActualNumber("N1")).toBe(31); // N1 = 1 + 30 = 31
      expect(getActualNumber("N15")).toBe(45); // N15 = 15 + 30 = 45
    });

    it("should convert G numbers correctly", () => {
      expect(getActualNumber("G1")).toBe(46); // G1 = 1 + 45 = 46
      expect(getActualNumber("G15")).toBe(60); // G15 = 15 + 45 = 60
    });

    it("should convert O numbers correctly", () => {
      expect(getActualNumber("O1")).toBe(61); // O1 = 1 + 60 = 61
      expect(getActualNumber("O15")).toBe(75); // O15 = 15 + 60 = 75
    });
  });

  describe("getColumnColor", () => {
    it("should return colors for each column", () => {
      expect(getColumnColor("B")).toBeTruthy();
      expect(getColumnColor("I")).toBeTruthy();
      expect(getColumnColor("N")).toBeTruthy();
      expect(getColumnColor("G")).toBeTruthy();
      expect(getColumnColor("O")).toBeTruthy();
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
  });
});
