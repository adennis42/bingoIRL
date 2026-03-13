import { z } from "zod";
import { MAX_ROUNDS, MIN_ROUNDS } from "@/lib/constants";
import type { WinningPattern } from "@/types";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
});

export const gameCodeSchema = z.object({
  code: z
    .string()
    .length(6, "Game code must be 6 characters")
    .regex(/^[A-Z0-9]+$/, "Game code must be uppercase alphanumeric"),
});

export const roundSchema = z.object({
  pattern: z.enum([
    "traditional_line",
    "four_corners",
    "blackout",
  ]) as z.ZodType<WinningPattern>,
  prize: z.string().optional(),
});

export const gameSetupSchema = z.object({
  totalRounds: z
    .number()
    .min(MIN_ROUNDS, `Must have at least ${MIN_ROUNDS} round`)
    .max(MAX_ROUNDS, `Cannot exceed ${MAX_ROUNDS} rounds`),
  rounds: z.array(roundSchema).min(1, "Must configure at least one round"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type GameCodeInput = z.infer<typeof gameCodeSchema>;
export type RoundInput = z.infer<typeof roundSchema>;
export type GameSetupInput = z.infer<typeof gameSetupSchema>;
