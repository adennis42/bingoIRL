# BingoIRL Design System

A playful, cel-shaded / Borderlands-inspired design system for **BingoIRL** — a real-time bingo hosting platform for live in-venue events.

Live URL: https://bingoirl.app
Source repo: https://github.com/adennis42/bingoIRL (branch: `main`)

---

## What is BingoIRL?

BingoIRL is the digital companion to a real-world bingo night. Hosts run live games (calling numbers, tracking rounds, picking winners, playing soundboard stings); players sit in the venue with physical cards and follow along on their phones. The app handles number calling, round progression, patterns, prizes, and a leaderboard — physical cards do the rest.

### Products / Surfaces

There is **one product** with two distinct audience surfaces, built in the same Next.js app:

1. **Host app** (`/host/*`) — signed-in hosts. Dashboard, game creation, live game view, patterns editor, leaderboard, settings / soundboard. Designed for one heavy user running the room.
2. **Player app** (`/play/*`) — anonymous players. 6-digit code entry, waiting screen, live follow-along. Designed for the crowd — the venue's patrons. Mobile-first, glanceable from a pub table.

Marketing landing page lives at `/` and shares the same visual system.

### Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Firebase (Firestore + Auth + Storage)
- Framer Motion, lucide-react, qrcode.react
- Vercel hosting

---

## Sources

Everything in this design system was derived from:

- **`adennis42/bingoIRL` GitHub repo** (primary source of truth)
  - `AGENTS.md` — the canonical current design direction (Borderlands / cel-shaded / halftone). **Read this first.**
  - `.cursorrules` — an earlier "electric violet" direction that has been superseded by `AGENTS.md`. A few components (GameLobby, host game view right panel) still reference the old tokens (`bg-base`, `card`, `--accent-primary`) — treat those as tech debt, not style guidance.
  - `src/app/globals.css` — CSS vars + a `.cel-btn-*` utility for the current look.
  - `src/app/page.tsx`, `src/app/play/page.tsx`, `src/app/host/dashboard/page.tsx`, `src/app/host/create/page.tsx` — the cleanest examples of the current visual direction. Copy their patterns, not the older ones.
  - `src/components/ui/button.tsx` — canonical button variants.
- **AGENTS.md project brief** from the user: "cell shaded / halftone theme similar to the Borderlands games."

No Figma, no decks, no standalone brand kit — the repo IS the brand guide.

---

## Index

Read in this order:

1. **`README.md`** (this file) — product context, content fundamentals, visual foundations, iconography
2. **`colors_and_type.css`** — all color + type + spacing + shadow tokens, ready to drop into an HTML file
3. **`SKILL.md`** — machine-readable entry point (Agent Skills compatible)
4. **`assets/`** — logo SVG, favicon, bingo-ball marks
5. **`fonts/`** — (empty; all fonts are Google Fonts — loaded via `<link>`)
6. **`preview/`** — small HTML cards that populate the Design System tab
7. **`ui_kits/web/`** — React (JSX) recreation of the Host + Player surfaces
   - `README.md` — component inventory
   - `index.html` — clickable prototype showing a full flow
   - `Button.jsx`, `BingoBall.jsx`, `GameCard.jsx`, etc.

No slide templates exist in the repo — `slides/` is intentionally absent.

---

## CONTENT FUNDAMENTALS

### Voice & tone
**Playful, loud, announcer-at-the-mic energy.** BingoIRL's copy reads like the guy with the microphone at a pub bingo night: punchy, no-nonsense, all-caps for anything important, never precious. It's a **live event app**, so copy leans imperative and present-tense: "CALL NUMBER", "LET'S PLAY", "START GAME", "NOW CALLING". No marketing fluff, no hedging.

### Point of view
**You-addressed, second-person, imperative.** The app tells the host what to do ("Enter your 6-character game code", "Share the code or QR to get players in"). It never says "we" about the product itself. No "I" voice from the app.

### Casing rules
- **UI chrome, buttons, labels, section headers, status pills → ALL CAPS.** `HOST A GAME`, `JOIN A GAME`, `NEW GAME`, `SETUP`, `LIVE`, `PAUSED`, `ENDED`, `NOW CALLING`, `RECENT CALLS`, `WIN PATTERN`.
- **Body copy / explanatory sentences → Sentence case.** "Enter your 6-character game code", "Players don't need an account to join", "Used for leaderboard tracking — winners are shown with this location."
- **Microcopy labels above inputs → ALL CAPS with wide tracking.** `EMAIL`, `PASSWORD`, `NUMBER OF ROUNDS`, `VENUE / LOCATION`.
- **Pattern names → Title Case or UPPER** — both appear: `TRADITIONAL LINE`, `FOUR CORNERS`, `BLACKOUT`.

### Length
Extremely tight. Almost no copy block exceeds one short sentence. Primary button labels are 1–3 words + maybe an arrow (`LET'S PLAY →`, `SIGN IN →`, `CREATE GAME`). Tagline on the landing page is exactly 7 words across two lines.

### Emoji
**No emoji. Zero. Ever.** The `AGENTS.md` rule is explicit: emojis break the cel-shaded aesthetic. Use text symbols (`✓ ✗ → ← ▲ ▼ ◆ ★ ↩ ›`) or SVG icons instead. A few legacy screens still have stray 🎴 / ⚠ characters — those are bugs, not style.

### Punctuation quirks
- **Em-dashes are common** for beats: "Call numbers · Track rounds", "Used for leaderboard tracking — winners are shown with this location."
- **Middot `·`** is used as a separator in dense lines and buttons: "FREE TO PLAY · NO ACCOUNT NEEDED".
- **Arrows** `→` `←` `›` carry a lot of semantic weight; they replace chevron icons on buttons and links.
- **Ellipsis `…`** on loading states: `SIGNING IN…`, `JOINING...`, `STARTING…`.
- **Stars `★`** bracket hype moments: `★ LIVE ACTION ★`.

### Voice examples — copy straight from the product

> "Call numbers · Track rounds / Manage winners in real time" *(landing tagline)*
> "FREE TO PLAY · NO ACCOUNT NEEDED" *(landing badge)*
> "★ LIVE ACTION ★" *(landing divider)*
> "HOST A GAME" / "JOIN A GAME" *(primary CTAs)*
> "Enter your 6-character game code" *(join screen subtitle)*
> "Hosting? Sign in here." *(join footer)*
> "Set up your rounds, then share the code" *(new-game subtitle)*
> "Used for leaderboard tracking — winners are shown with this location" *(help text)*
> "Players don't need an account to join" *(lobby footer)*
> "Waiting for first call…" *(empty state)*
> "LET'S PLAY →" *(form submit)*

When writing new copy, read a handful of these out loud first. If it doesn't sound like an announcer — rewrite.

---

## VISUAL FOUNDATIONS

The entire system is **cel-shaded comic-book / Borderlands-inspired**. Think heavy black borders, hard drop shadows with no blur, chunky gradient fills on buttons, all-caps display type with a 2–3px offset text shadow. Every UI choice should reinforce this. If something looks generic dark-mode SaaS, it's wrong.

### Colors
- **Near-black backgrounds** (`#111` page, `#1a1a1a` cards, `#161616` deprioritized) — never pure black and never a gradient. Flat.
- **Five gradient "ball" colors** — each uses a top-highlight → mid → bottom-shadow 3-stop gradient. These map 1:1 to the bingo columns (B/I/N/G/O) and also do double duty as semantic colors:
  - **Gold / Yellow** (`#f5c542` base) → Primary CTAs, highlights, B column
  - **Red** (`#e84040` base) → Danger, destructive, I column
  - **Blue** (`#4db8ff` base) → Secondary / Join CTA, N column (note: N and Blue are split in different screens — see `colors_and_type.css`)
  - **Green** (`#50e878` base) → Success, Live status, G column in some legacy screens
  - **Orange** (`#ff6b35` base) → Accents, O column, "paused" status
- **Borders and shadows are always `#111`** — not a gray, not transparent. Pure near-black. `3px solid #111` is the default; `2px` on small chips.
- **Text: white on dark, `#555` for muted, `#333` for disabled.** `#f5c542` (gold) is used for inline links and form labels.

### Type
- **Display / headings** → `Arial Black`, `Impact`, sans-serif stack. Always `font-black` (900), uppercase, often `tracking-wide` to `tracking-widest`. Headings ALWAYS get a text shadow: `textShadow: "2px 2px 0px #111"` (small) or `"3px 3px 0px #111"` (hero).
- **Body / UI** → `DM Sans` via `next/font`. Body text is mostly bold (`font-bold`) even at small sizes — the design has no lightweight text.
- **Mono / numbers / game codes** → `JetBrains Mono` (but game codes are often rendered in Arial Black with wide letter-spacing for impact). Number balls use mono for the numeric part.
- **NOTE:** `Syne` is imported in `layout.tsx` as the old heading font. It is still wired up but most current screens override it with inline `fontFamily: "'Arial Black', Impact, sans-serif"`. The system treats **Arial Black/Impact as the canonical heading stack** and Syne as legacy.

### Spacing & layout
- Mobile-first. Main content maxes out around `max-w-sm` / `max-w-xl` on content pages; the host game view goes `max-w-7xl` for three-column desktop.
- Comfortable padding — cards are `p-5` or `p-6`, not dense.
- Vertical rhythm via `space-y-5` / `space-y-6` between sections.
- Hit targets for buttons are generous — `h-11` default, `h-14` large, `h-16` XL. Player number grid cells use `w-12 h-12` minimum.

### Backgrounds
- **Flat near-black.** No gradients on page backgrounds.
- **Halftone dot pattern** is available (`.bg-dots` utility) as subtle texture on large areas — `radial-gradient(rgba(108,99,255,0.15) 1px, transparent 1px)` at 24px grid. Use **sparingly**; it's an accent, not default. (The current cel-shaded theme uses near-black flat; the halftone is a theme asset to lean into when adding texture.)
- No imagery, no photography, no full-bleed hero images. The visuals ARE the UI.

### Animation & motion
- **Motion is punchy and spring-based, not smooth/eased.** Framer Motion is used with spring physics: `type: "spring", stiffness: 220, damping: 22` for the BingoBall 3D-spin entry.
- Number-ball number changes trigger a rotateY(-90° → 0° → 90°) with scale pop — feels like a tumbler on a real bingo ball.
- Screen transitions are minimal fade-slide (y: 8px → 0, 0.3s).
- Hover on cards: `translate-y: -2px` — no brightness or shadow change beyond the lift.
- Press on buttons: **literally translate the button `(2px, 2px)` down-right and shrink the hard shadow from `5px 5px 0px #111` to `2px 2px 0px #111`.** This is the most important motion tell in the whole system — it simulates the button being "pushed into" the page.
- Respect `prefers-reduced-motion`.

### Hover / press states
- **Buttons — hover:** `translate(-2px, -2px)` AND the hard shadow grows from `4px 4px 0px #111` → `6px 6px 0px #111` (or `5→7` on landing). The button "lifts toward" the cursor.
- **Buttons — active (press):** `translate(2px, 2px)` AND shadow collapses to `1px 1px` or `2px 2px`. Gives a satisfying hard click.
- **Cards — hover:** `-translate-y-0.5` lift, no color change.
- **Text links — hover:** goes from `#555` / `#666` to `#f5c542` gold; **never** use underline for primary links (except true prose links in footers).
- **Icon/nav "ghost" buttons — hover:** `bg-white/10` background tint, text goes from `#ccc` to white.
- **Opacity 0.4** for disabled. Cursor becomes `not-allowed`.

### Borders & corners
- **`3px solid #111`** is the standard — on buttons, cards, panels, input boxes, code entry tiles.
- **`2px solid #111`** on small elements — status pills, badges, chips.
- **Sharp corners.** No `rounded-lg`/`rounded-2xl` on primary chrome. A few legacy screens still use `rounded-xl` and `rounded-2xl` inside cards — those are carryover from the old system and should not propagate. The rule: **cel-shaded = sharp.** The only allowed rounding is:
  - Circular (the BingoBall)
  - Tiny `rounded-lg` on the host-view grid cells for ergonomics (still bordered, still shadowed)

### Shadows
**One shadow system: hard, offset, no blur, always black.** These are the values that show up everywhere:
- Chips / small badges: `box-shadow: 2px 2px 0px #111`
- Cards / regular elements: `box-shadow: 3px 3px 0px #111` or `4px 4px 0px #111`
- Primary CTAs and hero cards: `box-shadow: 5px 5px 0px #111` or `6px 6px 0px #111`
- Hover state: add 2px to X and Y
- Press state: collapse to `1px 1px` or `2px 2px`

**Inset shadows** add the plastic / cel-shaded highlight on gradient buttons:
- Top inner light: `inset 0 1px 0 rgba(255,255,255,0.5)` (yellow/blue) or `rgba(255,255,255,0.35)` (red)
- Bottom inner dark: `inset 0 -3px 0 #8a6600` (yellow), `inset 0 -3px 0 #004d99` (blue), etc. — always a darkened version of the mid color.

### Transparency & blur
- Avoid it. The cel-shaded style is opaque and solid.
- Ambient "glow" areas behind cards (legacy host game view) use `blur-[120px]` on radial blobs — this is from the OLD direction and should be phased out.
- A couple of overlay states use color-at-`10%`-opacity fills (`bg-warn/10`, `bg-gold/10`) with a matching border — acceptable inside cards, not on chrome.

### Layout rules
- Nothing is position-fixed except overlays (modals, bottom sheets, toast).
- Ambient background blobs (`position: fixed inset-0 pointer-events-none`) exist in the legacy `GameLobby.tsx` — deprecated pattern.
- Header is content-level, not sticky. Back button lives inline at the top-left of every sub-page.
- Mobile stacks; desktop splits into 2–3 columns at `md:` and `lg:`.

### Cards
Canonical card recipe:
```css
background: #1a1a1a;
border: 3px solid #111;
box-shadow: 4px 4px 0px #111;
/* sharp corners — no border-radius */
padding: 1.25rem; /* p-5 */
```
A "deprioritized" card variant drops shadow to `3px 3px` and lightens bg to `#161616` with `opacity-60`.

### Color vibe of imagery
There is no imagery. If you're adding any, it should be:
- **Warm and saturated** (yellow/red/orange pull).
- **High-contrast, halftone-dotted, or cell-shaded** — the Borderlands treatment. A photograph should be posterized / 2-tone / duotone before being used.
- **Never** soft, gradient, or ambient.

---

## ICONOGRAPHY

### Approach
The codebase pulls in **`lucide-react`** as its icon library (declared in `package.json`) but — honestly — most of the current UI uses **Unicode text symbols** instead of actual icons: `→`, `←`, `›`, `✓`, `✗`, `★`, `↩`, `＋`, `−`, `⚠`. This is on-brand: text symbols render in the same chunky cel-shaded style as the rest of the UI and don't require icon packages.

### Rules
1. **No emoji.** Strictly. `AGENTS.md` rule, and you'll find a few stray 🎴 / ⚠ / 🤷 characters in the code — those are explicitly marked as bugs to be removed.
2. **Prefer Unicode text symbols** for directional affordances (arrows, checkmarks, stars). They pick up the `font-black uppercase` treatment automatically.
3. **Reach for `lucide-react` SVGs** when a symbol isn't enough — but render them at **`strokeWidth: 3` minimum** so they match the chunky 3px-border aesthetic. Thin-stroked icons look foreign.
4. **No custom icon font.** No sprite. No in-house icon library.
5. **The BingoBall IS the brand mark.** It functions as both a logo element and the central decorative icon. See `assets/`.

### Available assets
- `assets/favicon.svg` — a bingo-ball-style favicon: yellow gradient circle with white band, "IRL" text, 3px black stroke, specular highlight. This encapsulates the whole brand in 64×64.
- `assets/logo-bingo-irl.html` (renders the wordmark) — the 5 colored tiles (B I N G O) + "IRL" tag.

### CDN substitution note
If you need icons beyond the Unicode set, use `lucide-react` from the repo, or link its CDN build. Flag: **no codebase icon sprite exists.** Keep `strokeWidth` high.

---

## CAVEATS

- **`Syne` vs `Arial Black` heading font:** the `layout.tsx` file loads Syne, but ~every visible screen overrides it with inline `'Arial Black', Impact`. I treated **Arial Black** as the canonical stack; Syne is available as a secondary option inside legacy components (`GameLobby`, parts of the host game view). If you want Syne to become primary again, it's a one-line change in `colors_and_type.css` — but the `AGENTS.md` brief is unambiguous about Arial Black / Impact.
- **Two design directions coexist in the repo:** the newer Borderlands/cel-shaded look (this system) and older "electric violet" tokens (`--accent-primary`, `bg-dots` with violet, `card` utility with soft shadow). I've captured the cel-shaded system as the source of truth; if a component references the old tokens, rewrite it against this system.
- **Font files:** BingoIRL uses Google Fonts (DM Sans, JetBrains Mono, Syne) via `next/font`. **No `.ttf` / `.woff` files ship in the repo.** The design system loads them from Google Fonts CDN. `fonts/` is empty on purpose. If an offline preview is needed, download them from fonts.google.com.
- **Arial Black as display:** it's a system font; no file ships. Falls back to Impact, then the generic sans stack.
- **No photography, illustration, or brand imagery** exists in the repo beyond the favicon. The visual identity is 100% typographic + geometric.
