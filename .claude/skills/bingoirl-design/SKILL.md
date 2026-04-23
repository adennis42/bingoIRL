---
name: bingoirl-design
description: Use this skill to generate well-branded interfaces and assets for BingoIRL, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping. BingoIRL is a real-time bingo hosting platform with a cel-shaded / Borderlands / halftone visual identity.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Files

- `README.md` — product context, content fundamentals, visual foundations, iconography
- `colors_and_type.css` — token CSS: colors, type, spacing, hard shadows, halftone utility, `.cel-btn-*`, `.cel-card`, `.cel-input`, `.cel-chip`
- `assets/` — favicon, logo
- `ui_kits/web/` — clickable React UI kit recreating Host + Player surfaces
- `preview/` — small HTML cards that document each token / component

## Non-negotiables

1. **No emoji.** Use Unicode symbols (`→ ← ✓ ★ ↩ ›`) or lucide-react SVGs at stroke-width ≥ 3.
2. **Borders are always `3px solid #111`** on chrome (`2px` on small chips). Never a gray; always near-black.
3. **Shadows are hard and black** (`Npx Npx 0 #111`) — no blur, no color.
4. **Display type** is `'Arial Black', Impact, sans-serif`, 900, uppercase, with a 2–3px offset text-shadow.
5. **Button press** must translate `(2px, 2px)` down-right and collapse the shadow to `1×1` or `2×2`.
6. **Sharp corners** by default. Rounding is reserved for the BingoBall and occasional ergonomic grid cells.
