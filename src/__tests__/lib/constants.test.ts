import { MAX_ROUNDS, MIN_ROUNDS, GAME_CODE_LENGTH } from "@/lib/constants";

describe("Constants", () => {
  it("should have MAX_ROUNDS defined", () => {
    expect(MAX_ROUNDS).toBeDefined();
    expect(typeof MAX_ROUNDS).toBe("number");
    expect(MAX_ROUNDS).toBeGreaterThan(0);
  });

  it("should have MIN_ROUNDS defined", () => {
    expect(MIN_ROUNDS).toBeDefined();
    expect(typeof MIN_ROUNDS).toBe("number");
    expect(MIN_ROUNDS).toBeGreaterThan(0);
  });

  it("should have GAME_CODE_LENGTH defined", () => {
    expect(GAME_CODE_LENGTH).toBeDefined();
    expect(typeof GAME_CODE_LENGTH).toBe("number");
    expect(GAME_CODE_LENGTH).toBeGreaterThan(0);
  });

  it("should have MIN_ROUNDS less than or equal to MAX_ROUNDS", () => {
    expect(MIN_ROUNDS).toBeLessThanOrEqual(MAX_ROUNDS);
  });
});
