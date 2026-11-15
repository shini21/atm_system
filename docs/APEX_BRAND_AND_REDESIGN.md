# Apex Bank — Brand Asset Inventory & Redesign Report

Scope: `frontend/` only. No backend, OOP model, API or business-rule code was changed.

## 1. Official asset inventory (source: `apex-bank-svgs.zip`)

Canonical copies live in `frontend/src/assets/brand/` (imported as raw SVG by `BrandLogo`).
`frontend/public/brand/app-icon/` keeps the three app-icon files for `<link>`/Open Graph use.

| File | Type | viewBox | Surface | Used for |
|---|---|---|---|---|
| `monogram/apex-monogram-dark.svg` | Monogram, white A + gold bar, obsidian plate | 0 0 64 64 | Dark | Sidebar / drawer mark; Dark-surface monogram |
| `monogram/apex-monogram-white.svg` | Monogram, obsidian A + gold bar, white plate | 0 0 64 64 | Light | Light-surface monogram |
| `monogram/apex-monogram-navy.svg` | Monogram, white A + platinum bar, navy plate | 0 0 64 64 | Navy | Available via `surface="navy"` |
| `monogram/apex-monogram-mono-white.svg` | Single-colour white, transparent | 0 0 64 64 | Dark/coloured | Card face (dark themes) |
| `monogram/apex-monogram-mono-black.svg` | Single-colour obsidian, transparent | 0 0 64 64 | Light/metallic | Card face (Platinum theme) |
| `lockup-horizontal/*-dark / -white / -navy` | Monogram + APEX/BANK, live `<text>` | -20 -10 320 120 | Dark / Light / Navy | Header, Welcome, PIN screen, receipt |
| `lockup-horizontal/*-mono-black / -mono-white` | Single-colour lockup, transparent | -20 -10 320 120 | Any | Reserved (not currently used) |
| `lockup-vertical/*` (5 variants) | Stacked lockup, live `<text>` | -20 -10 240 210 | as above | Available via `variant="vertical"` |
| `app-icon/apex-app-icon-obsidian.svg` | 512 px app icon | 0 0 512 512 | — | `apple-touch-icon`, Open Graph, help dialog |
| `app-icon/apex-app-icon-navy.svg` | 512 px app icon | 0 0 512 512 | — | Reserved |
| `app-icon/apex-favicon.svg` | Favicon | 0 0 64 64 | — | Browser favicon |

### How the lockups are rendered
The lockups use live `<text>` (APEX: Cormorant Garamond 600, BANK: Instrument Sans 500). An `<img src>` SVG
cannot use the page's web fonts, so `components/brand/BrandLogo.tsx` **inlines the original markup**. Geometry,
text, font attributes and colours are untouched; the only transformation is removing the opaque background
`<rect>` (unless `plate` is passed) so the mark sits on Porcelain / Obsidian surfaces. The fonts are loaded from
Google Fonts in `index.html` and `index.css`. Converting the text to outlines (per the package README) would make
the lockups self-contained and is recommended before any production use.

## 2. What changed

- **Tokens** (`index.css`, `tailwind.config.js`): brand palette; Porcelain screen, Warm Stone enclosure; light is the
  default theme, dark is opt-in. Primary actions are Midnight Navy (Champagne Gold in dark mode).
- **Brand**: `BrandLogo` (header, welcome, PIN, receipt, sidebar); favicon and touch icon switched to the official files.
- **Cards**: `ApexCard` replaces `TiltedATMCard` — 85.6:53.98 ratio, container-query sizing, EMV chip, contactless mark,
  masked number (last four only), real cardholder/expiry/status, accessible flip (`aria-pressed`), no CVV anywhere.
  Six visual themes in `utils/cardThemes.ts` (default Institutional Black). Tier and theme are independent props.
- **Welcome**: two-column layout, card preview bound to the selected profile, reader status, profile selector with
  `aria-pressed` state, Insert Card / Exit, design + tier preview selectors.
- **PIN**: card preview, masked four-slot field with show/hide, on-screen keypad synchronised with the hardware pad.
- **Shell**: warm-stone enclosure with edge highlights, wider layout, session-status chip, new footer disclosure.
- **Hardware**: card reader, cash dispenser, receipt printer and PIN pad restyled; all indicators still come from
  `HardwareContext`; labelled "Simulated".
- **Receipt**: `ReceiptDocument` (official logo, masked account, status, amount, balance after); print CSS prints only
  the receipt. Shown in the focus-managed `Modal`.
- **Modal**: focus trap, focus restore, per-instance ARIA ids, no blur backdrop.
- **Removed false claims**: "PCI-PTS v6", "Hardware Encrypted", "PCI-PTS Certified", "256-Bit", an unsourced toll-free number and
  support e-mail, and the "RBI" mark on simulated notes (now "SIM").
- Fixed missing i18n key `dash.miniStatement` (was rendering the raw key).

## 3. Known gaps / decisions for the team

1. **No tier or payment network in the model.** `CardStatus` has neither. Tier is an optional prop (default none) and the
   Welcome page offers a clearly-labelled *presentation-only* preview. The network slot shows a dashed
   "DEBIT · NETWORK N/A" placeholder. Add the fields to the backend card model to make both real.
2. **Transaction flows are still full-screen routes**, not modals (Deposit, Withdraw, Transfer, Balance, History,
   Change PIN). They inherit the new tokens and keep all validation, but were not rebuilt as a unified modal system.
3. **Contrast deviations**: `--text-secondary` is `#4A5568` and tertiary `#667286` (brand secondary `#718096` is ~4.0:1
   on white, below AA for small text). Success/Warning/Error use darkened variants for *text* on light surfaces; the
   brand values remain the dark-mode/fill values.
4. Dark mode is retained as an opt-in toggle (obsidian + gold).
5. `SettingsPage` still describes an "emerald neon" appearance option in its copy; `CardGraphic.tsx` and
   `SpotlightCard.tsx` are pre-existing unused components.
6. Pre-existing `oxlint` warnings (hook dependency / immutability) in Deposit/Withdraw/Transfer pages were not touched.

## 4. Verification performed

- `npx tsc -b` — clean. `npx vitest run` — 39/39 pass (31 existing, labels updated for new copy; 8 new in
  `BrandAndCards.test.tsx`). `npx vite build` — succeeds.
- Headless Chrome against the dev server and the running backend: Welcome → Insert Card → PIN (on-screen keypad) → Dashboard
  for CARD1001 at 1440, 1024, 768, 390 and 360 px — no horizontal overflow at any width; help dialog takes focus.
- **Not exercised end-to-end**: deposit, transfer, PIN change, expired/blocked card flows in the browser, keyboard-only
  traversal, reduced-motion rendering, and a formal contrast audit. Reduced-motion is implemented (global CSS +
  card flip) but not visually checked.
