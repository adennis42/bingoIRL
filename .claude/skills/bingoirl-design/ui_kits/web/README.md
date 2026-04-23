# BingoIRL UI Kit — Web

High-fidelity recreation of the BingoIRL Next.js web app, rebuilt as single-file React (JSX) components. Visual parity is the goal; Firebase is stubbed out to let the prototype click through.

## Components

- **CelButton.jsx** — primary/secondary/success/danger/ghost button variants, matches `src/components/ui/button.tsx`. `translate-on-press` hard-shadow motion.
- **CelInput.jsx** — dark input with `3px #111` border, hard shadow, gold focus.
- **BingoLogo.jsx** — the BINGO tile wordmark + IRL tag. Hero and compact sizes.
- **BingoBall.jsx** — 3D radial-gradient ball with white oval label + column letter + number. No Framer Motion dependency; uses a CSS keyframe spin on key change.
- **StatusChip.jsx** — `SETUP / LIVE / PAUSED / ENDED` gradient pills.
- **GameCard.jsx** — active / past game list card from the host dashboard.
- **PatternVisualizer.jsx** — 5×5 bingo pattern grid. Yellow filled cells on dark.
- **CelCard.jsx** — panel primitive with the canonical `3px #111 + 4×4 shadow` recipe.
- **Screens.jsx** — `LandingScreen`, `JoinScreen`, `LoginScreen`, `DashboardScreen`, `LiveGameScreen`, `PlayerScreen` — the click-thru.

## Prototype flow

`index.html` boots with the landing page and lets you walk through:

1. **Landing** → HOST A GAME / JOIN A GAME
2. **HOST** → Login → Dashboard → Live game view (call numbers)
3. **JOIN** → Code entry → Player live view (follows whatever the host called)

Host and player views share a single in-memory game state, so pressing numbers in one view updates the other.

## Sourced from

All components were built by reading `src/app/*` and `src/components/*` in `adennis42/bingoIRL@main` and lifting exact values — hex codes, border widths, shadow offsets, gradients. No visuals were inferred from screenshots.
