# UI REDESIGN PROMPT — APEX ATM TERMINAL (Frontend only)

You are a Senior Frontend Engineer and Product Designer. Redesign the **frontend only** of my existing APEX ATM Simulation app so it looks and feels like a real, premium ATM terminal with purposeful, polished animation.

## 0. Scope and hard rules

- Work in the existing repo, on the branch `feature/premium-atm` (create it if missing; never push to main, never force-push).
- **Do NOT change the Java backend, REST endpoints, request/response shapes or business logic.** All balances, limits, note breakdowns and results keep coming from the Java API. No fake data, no simulated success in React.
- Keep React + Vite + TypeScript + Tailwind + Motion for React + Lucide. Keep every existing feature working (login/PIN, withdraw, deposit, transfer, balance, mini statement, history, PIN change, receipt, logout, session timeout, EN/language toggle, theme toggle, sound toggle).
- Before starting: read your installed skills (UI/UX Pro Max first, plus any React/Tailwind/animation skills) and actually apply them. If a skill is not installed, say so in `SKILLS_AUDIT.md` and continue. Do not invent skills.
- Work in small phases. After each: run `npm run build` and the frontend tests, review the diff, make sure no secrets or build output are included, update `PROJECT_PROGRESS.md`, commit, push, and verify the push. If a push fails, keep the commit, report the exact error, continue locally.
- Never claim a build/test/commit/push succeeded without running it and reading the output.

## 1. Problems in the current UI (fix these)

1. It reads as a generic SaaS dashboard: white card inside a white card inside a grey page. There is no physical ATM feel.
2. The dashboard is a grid of six near-identical rounded cards with arrows in random colours (red, green, blue, purple). The colours carry no meaning. Transaction History and Receipt are not first-class operations.
3. Low contrast: light grey text on grey/white surfaces (customer name, account line, descriptions, labels). Fails WCAG AA.
4. The dashboard shows `ACC1001` unmasked. Account numbers must be masked everywhere.
5. The session countdown is not visible on the dashboard.
6. The layout sits left-aligned with empty space on wide screens; it is not centred or framed.
7. The primary action ("Start New Session") is visually weak (grey on grey).
8. Hierarchy is flat: the balance is big, everything else is the same weight.

## 2. Design direction: "private-bank ATM terminal"

Build a **terminal chassis** around the screen, not a webpage:

- **Bezel and body**: a matte, restrained housing (dark graphite in dark theme, warm stone/ivory in light theme) with subtle material depth (soft inner shadow, fine edge highlight, no glossy gradients).
- **Screen**: the actual UI lives in a recessed display with its own typographic system. Screen content must have strong contrast.
- **Side function keys**: 3–4 physical-looking keys on each side of the screen, aligned to on-screen menu rows (classic ATM layout). Menu items on screen are labelled rows that point at those keys; clicking either the row or the key triggers the action. Keys have a real press travel animation.
- **Physical numeric keypad** below the screen (0–9, Clear, Cancel, Enter) with tactile press (scale + shadow travel, spring). Physical keyboard input must also work.
- **Hardware details**: card slot with an indicator light, cash dispenser tray, receipt slot, small status LEDs (ready / processing / card in). These are driven by real app state.
- Tablet and small widths: collapse side keys into on-screen rows and keep the keypad; the screen stays the hero. Never horizontal-scroll.

Avoid: nested cards, purple/blue AI gradients, heavy glassmorphism, stock illustrations, oversized headings, decorative floating elements, rainbow accents.

### Palette and type (define as tokens first)

- One restrained brand accent (deep emerald or deep indigo, pick one and justify it in `DESIGN_SYSTEM.md`) plus a single warm metallic accent used rarely (e.g. card chip, key legends).
- Semantic colours only for meaning: success, warning, danger, info. A debit is never the same colour as a credit by accident.
- Type: a refined sans for UI plus a monospaced face for amounts, references and masked numbers. Tabular numerals for all money. Define a type scale, spacing scale (4px base), radius scale (max 2 radius sizes), shadow scale, and motion tokens (durations, easings, spring presets) in Tailwind config + CSS variables.
- Light and dark theme, both fully designed (not auto-inverted). Persist the choice. Check contrast for both (AA minimum).

## 3. Screen-by-screen spec

1. **Welcome**: bank mark, "Insert your card" prompt, card slot glowing softly, card picker showing the demo cards, language selector. Card insertion animation: the card slides into the slot, slot LED turns amber, then the PIN screen.
2. **PIN entry**: four dots filling with a spring pop, shake + red flash on a wrong PIN, attempts-remaining text, blocked and expired card states with clear messages. Never show digits.
3. **Main menu**: customer name (high contrast), account type, **masked** account, live session ring/timer (60s inactivity, warning state in the last 15s). Menu of 8 operations as labelled rows tied to the side keys: Withdraw, Deposit, Transfer, Balance, Mini Statement, History, Change PIN, Eject Card. Receipt is offered contextually after each transaction and from History. Balance is shown prominently but not on every screen.
4. **Withdraw**: preset amounts as side-key rows, plus "Other amount" with the keypad. Server validates. Processing state, then **dispense animation driven by the note breakdown returned by Java** (₹500/₹200/₹100 notes sliding into the tray, count matches the API). Success screen with updated balance and "Print receipt?".
5. **Deposit**: amount entry, cash-insert animation, counting animation (ticker up to the confirmed amount), confirmation, updated balance.
6. **Transfer**: beneficiary entry, server-side validation result, confirmation summary, reference number, receipt option.
7. **Balance / Mini statement / History**: clean ledger rows (date, type, debit/credit with sign and colour plus icon, amount, balance after, status). History has filters and an animated list. Use a table or timeline, not cards.
8. **Receipt**: receipt paper emerges from the slot (clip + translate reveal), monospaced thermal-paper look, print and download buttons.
9. **Card return / session end**: the screen you showed me is the base. Keep the card-eject animation, make it centred, and give the "Start new session" button clear emphasis.
10. **Errors**: every API failure shows a real, specific message on screen (never a silent failure and never fake success).

## 4. Animation sources (free only, used sparingly)

First open each site below, read the documentation for the specific component, and check its licence in the repo or docs before copying anything. Prefer components that are free; do not use anything behind a paid plan. Install through the project's supported CLI (shadcn or jsrepo) where offered, otherwise copy the code and keep the licence header. Record every borrowed component in `SKILLS_AUDIT.md` (name, source URL, licence, where used). **Use at most four sources in total.**

| Source | Use it for | Candidates (verify they exist and are free) |
|---|---|---|
| Motion (motion.dev) / Motion for React | The foundation for everything custom | springs, `AnimatePresence`, layout animations, `useReducedMotion` |
| Magic UI (magicui.design) | Numbers and progress | Number Ticker (balance, counting), Animated Circular Progress Bar (session timer), Animated List (history), Border Beam (processing) |
| Motion Primitives (motion-primitives.com) | Screen and text transitions | Transition Panel (screen changes), Text Morph / Text Scramble (status text), Animated Number, Morphing Dialog (receipt), Progressive Blur |
| React Bits (reactbits.dev) | Text effects, very selectively | Count Up, Shiny Text, Decrypted Text for processing messages. No loud backgrounds on the ATM screen |
| Aceternity UI free set (ui.aceternity.com) | The bank card visual | 3D card hover/tilt for the card graphic. Free components only |
| 21st.dev | Reference and specific parts | Browse for PIN/OTP inputs, steppers and keypad inspiration; check the licence of the exact component. Also look at "Ink Orbit" (hardware-style tactile controls) for key-press ideas |
| LottieFiles (lottiefiles.com) | Small illustrative animations | Cash counting, money dispensing, success tick, receipt printing, card insertion. Check each animation's licence, credit the creator, load with a lightweight player, lazy-load, and keep a Motion-based fallback |

Rules for using them:

- Each borrowed piece must serve a screen in section 3. No effects for decoration.
- Restyle every borrowed component to the design tokens. It must not look "off the shelf".
- If a library site is unreachable, build the effect with Motion instead and note it.

## 5. Motion rules

- One shared set of durations and spring presets (tokens). Screen transitions 250–400 ms; key presses under 120 ms; processing loops are calm.
- Screen transitions: horizontal slide plus fade between ATM screens via `AnimatePresence`; no abrupt swaps.
- Everything honours `prefers-reduced-motion`: replace movement with fades or instant changes, but keep the state feedback.
- Animations must never delay or hide a result. If the API returns early, the animation completes quickly; if the API is slow, show an honest processing state.
- Use transform and opacity only for continuous animation. Lazy-load heavy assets. Check performance (no jank on a mid-range laptop).
- Sound (the speaker toggle): subtle key click, dispense whirr, receipt printer. Muted by default or follow the existing toggle. Use small free/licensed audio or WebAudio generated tones. Record the source and licence.

## 6. Accessibility and responsiveness

- WCAG AA contrast, visible focus rings, full keyboard operation (digits, Enter, Esc/Cancel, arrow keys across menu rows).
- `aria-live` regions for status, errors and balance changes. Move focus sensibly on every screen change.
- Hit targets at least 44px. Test at 1440, 1024 and 768 px widths, and at 125% zoom.

## 7. Process and deliverables

1. **Phase U0 — Audit**: screenshot the current screens, list components, read skills, write a short design brief and token proposal in `DESIGN_SYSTEM.md`. Show me the proposed palette and layout sketch (ASCII or simple HTML) before heavy implementation. Continue unless something blocks you.
2. **U1 — Tokens, theme, chassis**: tokens, light/dark, terminal body, side keys, keypad, status LEDs.
3. **U2 — Welcome, card insertion, PIN**.
4. **U3 — Main menu with side-key mapping and session timer**.
5. **U4 — Transaction screens** with dispense, counting and processing animations wired to the real API.
6. **U5 — Receipt, history, mini statement, errors**.
7. **U6 — Polish**: reduced motion, responsive, accessibility pass, performance pass, sound.
8. **U7 — Verify**: run the app against the real backend and complete every flow (withdraw, deposit, transfer, PIN change, blocked card, expired card, wrong PIN x3, session timeout, theme and language switch). Update tests (Vitest/RTL, and one Playwright happy path if feasible). Update README with screenshots.

After each phase: build, test, commit, push, verify, update `PROJECT_PROGRESS.md` with files changed, test results, commit hash, known issues and the exact next step.

## 8. Definition of done

- No white-on-white nested cards; the terminal chassis is visible on desktop and degrades well on tablet.
- Dashboard has all eight operations, tied to side keys, with meaningful (not rainbow) colour use.
- Account and card numbers are masked everywhere. PIN is never shown or logged.
- Every animation has a purpose and a reduced-motion version.
- Withdrawal dispense animation matches the Java-returned note breakdown.
- Both themes pass contrast checks.
- Borrowed components and assets are listed with licences in `SKILLS_AUDIT.md`.
- Build and tests were actually run and the real results are reported.

Keep chat replies short: what changed, results, commit hash, push status, next step. Put detail in the docs.
