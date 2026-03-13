import {
  PATTERN_DEFINITIONS,
  getPatternName,
  getPatternDescription,
} from "@/lib/utils/patterns";

describe("Pattern Utilities", () => {
  describe("PATTERN_DEFINITIONS", () => {
    it("should have traditional_line pattern", () => {
      expect(PATTERN_DEFINITIONS.traditional_line).toBeDefined();
      expect(PATTERN_DEFINITIONS.traditional_line.name).toBe("Traditional Line");
    });

    it("should have four_corners pattern", () => {
      expect(PATTERN_DEFINITIONS.four_corners).toBeDefined();
      expect(PATTERN_DEFINITIONS.four_corners.name).toBe("Four Corners");
    });

    it("should have blackout pattern", () => {
      expect(PATTERN_DEFINITIONS.blackout).toBeDefined();
      expect(PATTERN_DEFINITIONS.blackout.name).toBe("Blackout");
    });
  });

  describe("getPatternName", () => {
    it("should return name for built-in patterns", () => {
      expect(getPatternName("traditional_line")).toBe("Traditional Line");
      expect(getPatternName("four_corners")).toBe("Four Corners");
      expect(getPatternName("blackout")).toBe("Blackout");
    });

    it("should return formatted name for unknown patterns", () => {
      // getPatternName returns the pattern string as-is if not found
      expect(getPatternName("custom_pattern")).toBe("custom_pattern");
      expect(getPatternName("unknown")).toBe("unknown");
    });

    it("should return name from custom patterns if provided", () => {
      const customPatterns = [
        { id: "custom1", name: "Custom Pattern 1", cells: [], userId: "user1", createdAt: new Date(), updatedAt: new Date() },
      ];
      expect(getPatternName("custom1", customPatterns)).toBe("Custom Pattern 1");
    });
  });

  describe("getPatternDescription", () => {
    it("should return description for built-in patterns", () => {
      expect(getPatternDescription("traditional_line")).toBeDefined();
      expect(getPatternDescription("four_corners")).toBeDefined();
      expect(getPatternDescription("blackout")).toBeDefined();
    });

    it("should return description from custom patterns if provided", () => {
      const customPatterns = [
        { 
          id: "custom1", 
          name: "Custom Pattern 1", 
          description: "Custom description",
          cells: [], 
          userId: "user1", 
          createdAt: new Date(), 
          updatedAt: new Date() 
        },
      ];
      expect(getPatternDescription("custom1", customPatterns)).toBe("Custom description");
    });

    it("should return empty string for unknown patterns without custom patterns", () => {
      expect(getPatternDescription("unknown")).toBe("");
    });
  });
});
