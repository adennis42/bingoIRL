# AGENTS.md — BingoIRL

## Project Overview
Real-time bingo hosting platform for live events.
- **Live URL:** https://bingoirl.app
- **Stack:** Next.js 14, TypeScript, Firebase (Firestore + Auth + Storage), Tailwind CSS
- **Repo:** https://github.com/adennis42/bingoIRL

## Design System — Borderlands / Cell-Shaded / Halftone
This is the core visual identity. Every UI decision should reinforce it.

### Core Aesthetic
- **Style:** Cel-shaded, comic-book, Borderlands-inspired
- **Heavy black borders:** `border-[3px] border-[#111]` or `3px solid #111` everywhere
- **Hard drop shadows (no blur):** `box-shadow: 3px 3px 0px #111` or `4px 4px 0px #111`
- **No rounded corners except subtle ones** — prefer sharp/angular
- **Bold, uppercase text:** `font-black uppercase tracking-widest`
- **Font stack:** `'Arial Black', Impact, sans-serif` for headings
- **Text shadows on headings:** `text-shadow: 2px 2px 0px #111`

### Color Palette
- **Background:** `#111` (near black)
- **Card/surface:** `#1a1a1a`
- **Gold/primary:** `#f5c542` with gradient `linear-gradient(to bottom, #ffe066 0%, #f5c542 45%, #c49200 100%)`
- **Red/danger:** `#e84040` with gradient `linear-gradient(to bottom, #ff7070 0%, #e84040 45%, #991a1a 100%)`
- **Green/success:** `#50e878` with gradient `linear-gradient(to bottom, #80ffaa 0%, #50e878 45%, #1a9933 100%)`
- **Blue/info:** `#4db8ff`
- **Muted text:** `#555`
- **Disabled/inactive:** `#333`

### Halftone Effect (optional, use sparingly on backgrounds)
- CSS dot pattern for texture on large background areas
- `radial-gradient(circle, #1a1a1a 1px, transparent 1px)` at small size (4-6px) for subtle halftone

### NO Emojis
- **Remove all emojis from UI** — they break the cel-shaded aesthetic
- Replace emoji icons with:
  - SVG icons (inline or from a library)
  - Text symbols (✓ ✗ → ← ▲ ▼ ◆ etc.)
  - Or simply remove them if decorative

### Buttons
All buttons should have the Borderlands gradient style:
- Gold CTA: gold gradient + black border + hard shadow + active translate effect
- Red destructive: red gradient + same treatment
- Green confirm: green gradient + same treatment
- Text color on colored buttons: `#111` (dark text on light buttons)

### Cards/Panels
```css
background: #1a1a1a;
border: 3px solid #111;
box-shadow: 4px 4px 0px #111;
```

## File Structure
```
src/
  app/
    (auth)/login/     — Login page
    (auth)/register/  — Register page
    host/
      create/         — Game creation
      dashboard/      — Host dashboard
      game/[gameId]/  — Live game host view
      leaderboard/    — Leaderboard page
      patterns/       — Custom pattern editor
      settings/       — Host settings (soundboard)
    play/
      page.tsx        — Join game page
      [gameId]/       — Player game view
  components/
    bingo/            — BingoBall, PatternCreator, PatternVisualizer
    host/             — GameLobby, WinnerModal, RoundCompleteModal, Soundboard, etc.
    shared/           — BackButton, BottomSheet, ConfirmModal, ErrorBoundary, etc.
    ui/               — button.tsx, input.tsx
  lib/
    firebase/         — config, auth, firestore, converters, storage
    hooks/            — useAuth, useGame, usePlayers, etc.
    utils/            — bingo.ts, errorHandler.ts, gameCode.ts, patterns.ts
    validations/
  types/index.ts      — All TypeScript types
```

## Current Task
Visual polish pass — Borderlands/cel-shaded theme reinforcement:
1. Remove ALL emojis from UI components (replace with text or SVG symbols)
2. Audit every component for theme consistency
3. Strengthen halftone/cel-shaded details where missing
4. Ensure all buttons use the gradient style
5. Ensure all cards/panels have hard black borders and drop shadows

## Build & Deploy
- Build: `cd /Users/andrew/.openclaw/workspace/bingoIRL && bun run build`
- Tests: `bun test` (122 pass / 130 fail is the pre-existing baseline — don't regress the 122)
- Push: `git add -A && git commit -m "<message>" && git push`
- **Always run build before committing.**

## Agent Rules
1. Read this file first
2. No emojis — ever
3. Inline styles OR Tailwind classes are both fine here (unlike the portfolio project)
4. Keep Firebase logic untouched — only touch UI/visual layer
5. Run build after changes, fix errors before committing
6. Don't break existing functionality — visual changes only unless asked
