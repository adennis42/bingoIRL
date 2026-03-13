import { generateGameCode } from "@/lib/utils/gameCode";

describe("Game Code Generation", () => {
  it("should generate a 6-character code", () => {
    const code = generateGameCode();
    expect(code).toHaveLength(6);
  });

  it("should generate alphanumeric codes", () => {
    const code = generateGameCode();
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
  });

  it("should generate unique codes", () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateGameCode());
    }
    // With 100 attempts, we should have mostly unique codes
    // (allowing for some collisions due to randomness)
    expect(codes.size).toBeGreaterThan(90);
  });

  it("should generate uppercase codes", () => {
    const code = generateGameCode();
    expect(code).toBe(code.toUpperCase());
    expect(code).not.toMatch(/[a-z]/);
  });
});
