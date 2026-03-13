import { GAME_CODE_LENGTH, GAME_CODE_CHARS } from "@/lib/constants";

export function generateGameCode(): string {
  let code = "";
  for (let i = 0; i < GAME_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * GAME_CODE_CHARS.length);
    code += GAME_CODE_CHARS[randomIndex];
  }
  return code;
}
