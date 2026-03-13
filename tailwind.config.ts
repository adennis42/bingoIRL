import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
        display: ["var(--font-syne)", "Syne", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      colors: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        border: "var(--bg-border)",      // keep for backward compat (border-border)
        "bg-border": "var(--bg-border)", // semantic alias
        primary: "var(--accent-primary)",
        secondary: "var(--accent-secondary)",
        warn: "var(--accent-warn)",
        gold: "var(--accent-gold)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-disabled": "var(--text-disabled)",
        "col-b": "var(--col-b)",
        "col-i": "var(--col-i)",
        "col-n": "var(--col-n)",
        "col-g": "var(--col-g)",
        "col-o": "var(--col-o)",
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(108, 99, 255, 0.4)",
        "glow-secondary": "0 0 20px rgba(0, 212, 170, 0.4)",
        "glow-gold": "0 0 20px rgba(255, 209, 102, 0.4)",
        "glow-warn": "0 0 20px rgba(255, 107, 107, 0.4)",
        "glow-b": "0 0 16px rgba(108, 99, 255, 0.5)",
        "glow-i": "0 0 16px rgba(0, 212, 170, 0.5)",
        "glow-n": "0 0 16px rgba(255, 209, 102, 0.5)",
        "glow-g": "0 0 16px rgba(255, 107, 107, 0.5)",
        "glow-o": "0 0 16px rgba(167, 139, 250, 0.5)",
        elevated: "0 4px 24px rgba(108, 99, 255, 0.12)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "number-pop": "numberPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "fade-up": "fadeUp 0.3s ease-out",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        numberPop: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
