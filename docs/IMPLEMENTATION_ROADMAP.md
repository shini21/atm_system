# APEX Touch Banking — Phased Implementation Roadmap

**Document Version:** 1.0.0  
**Phase:** Phase 0 — Baseline & Roadmap Planning  
**Date:** November 14, 2026  
**Architecture:** Java 17 Spring Boot Backend + React 19 / TypeScript Touchscreen Terminal  

---

## 1. Roadmap Architecture & Execution Principles

This roadmap translates the visual and interaction requirements of the **APEX Theme and UI Style Guide** into a controlled, phase-gated engineering execution plan.

### Core Non-Negotiable Rules
1. **Preservation Priority**: Working functionality, verified routes, and backend contracts are preserved across every phase.
2. **Phase Gates**: Every phase requires explicit verification, documentation update, and user sign-off before proceeding to the next.
3. **Strict Backend Truth**: No simulated or fabricated financial data. Balances, transaction outcomes, account profiles, and note denominations are authoritative from the Java backend.
4. **Zero-Mock Policy**: If a design requirement requires data not exposed by the Java backend, document the limitation and use honest empty states rather than inventing fake data.
5. **Continuous Runnable State**: Both backend and frontend must compile, pass tests, and remain fully runnable after every phase.

---

## 2. Capabilities Classification & Feature Mapping

Before planning phase scope, all capabilities are categorized into four distinct classes:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAPABILITY CLASSIFICATION                       │
├────────────────────────────┬───────────────────────────────────────────┤
│ [WORK] Working Baseline    │ Fully functional, verified against tests  │
│ [REFI] Refinement Scope    │ Existing logic needing styling / tokens   │
│ [IMPL] New Implementation  │ Missing design guide surfaces & primitives│
│ [BLCK] Backend Constrained │ Architectural boundary; honest fallback   │
└────────────────────────────┴───────────────────────────────────────────┘
```

| Area | Feature / Capability | Classification | Technical Mapping |
|---|---|---|---|
| **Auth** | Card + PIN Authentication | **[WORK]** | `POST /api/auth/login` (BCrypt validated) |
| **Auth** | Username + Password Login | **[BLCK]** | Backend model uses Card Number + PIN; no username model exists. Maintain Card + PIN authentication per design guide §10.1. |
| **Auth** | Biometric Login | **[BLCK]** | Strictly disallowed by backend and design guide §10.2. |
| **Auth** | 3-Attempt Lockout | **[WORK]** | Enforced by `PinSecurityService` & `CardEntity.blocked`. |
| **Accounts** | Savings & Current Accounts | **[WORK]** | Polymorphic OOP domain classes (`SavingsAccount`, `CurrentAccount`). |
| **Accounts** | Balance Visibility Toggle | **[REFI]** | Local client state to mask/unmask `account.availableBalance`. |
| **Accounts** | Analytics & Balance Trends | **[BLCK]** | Backend stores transactional history; balance trend charts must be derived strictly from real past transactions in `transactions` table. |
| **Cash Ops** | Deposit (₹100, ₹200, ₹500) | **[WORK]** | `POST /api/transactions/deposit`, updates inventory. |
| **Cash Ops** | Withdraw with Breakdown | **[WORK]** | `POST /api/transactions/withdraw`, greedy breakdown algorithm. |
| **Cash Ops** | Inter-Account Transfer | **[WORK]** | `POST /api/transactions/transfer`, atomic ledger update. |
| **Hardware** | Note Dispenser Animation | **[REFI]** | Hardware bay animation driven strictly by backend note breakdown. |
| **Hardware** | Thermal Receipt Print | **[WORK]** | Thermal paper roll simulation, browser print dialog. |
| **Hardware** | Sound Synthesizer | **[WORK]** | Zero-dependency Web Audio API sound generator. |
| **UI Design** | Warm Ivory & Champagne Theme | **[IMPL]** | Central design token migration in `index.css` & Tailwind. |
| **UI Design** | Industrial Navy Theme | **[IMPL]** | Dark mode token migration in `index.css` & Tailwind. |
| **UI Design** | IBM Plex Sans & Mono | **[IMPL]** | Font import and Tailwind typography integration. |
| **Navigation**| Collapsible Glass Sidebar | **[IMPL]** | New desktop navigation shell with expandable state. |
| **Navigation**| Floating Glass Bottom Nav | **[IMPL]** | New mobile capsule navigation with touch targets. |
| **Settings** | User Preferences & Theme | **[IMPL]** | New settings layout: Account, Preferences, Security, Appearance. |

---

## 3. Phased Implementation Breakdown

---

### Phase 1 — Design System Foundation
* **Objective**: Establish the core visual tokens, theme engine, typography, and layout primitives mandated by the Style Guide.
* **Scope**:
  1. Centralize design tokens in CSS variables:
     - Light Theme: **Warm Ivory & Champagne** (Background `#F5F2EB`, Main surface `#FFFEFA`, Elevated `#EEE9DF`, Border `#DCD4C7`, Navy `#253448`, Emerald `#009F7D`, Electric cyan `#36BCE8`, Champagne `#B9945B`).
     - Dark Theme: **Industrial Navy** (Background `#0B1220`, Main surface `#111C2E`, Elevated `#18263A`, Border `#293A50`, Text `#F4F7FA`, Muted text `#AAB8C8`).
     - Semantic Status: Success `#269B70`, Warning `#D99A28`, Error `#D64545`, Info `#3976B8`.
  2. Integrate typography:
     - Primary UI: **IBM Plex Sans** (weights 300, 400, 500, 600, 700).
     - Technical / Numeric: **IBM Plex Mono** (weights 400, 500, 600, 700).
  3. Expand `tailwind.config.js` to expose semantic tokens, radius scale, and elevation shadows.
  4. Refine `ThemeContext.tsx` to ensure expanding reveal transition, system preference default, and zero transaction disruption upon switching.
  5. Validate WCAG 2.2 AA contrast ratios for both light and dark themes.
* **Files Likely to Change**:
  - `frontend/src/index.css`
  - `frontend/tailwind.config.js`
  - `frontend/src/context/ThemeContext.tsx`
  - `frontend/index.html`
* **Verification Plan**:
  - Contrast check across all background/text pairs ($\ge 4.5:1$ for normal text, $\ge 3:1$ for large/graphics).
  - Vitest suite execution (`npm test -- --run`).
  - Production build verification (`npm run build`).

---

### Phase 2 — Shared Component Library
* **Objective**: Refine and standardize the reusable component library adhering to the design guide's hybrid architecture.
* **Scope**:
  1. Standardize UI primitives in `frontend/src/components/ui/`:
     - **Button & IconButton**: Support all 11 lifecycle states (default, hover, focus, active, disabled, loading, error, success, selected).
     - **Input / FormField**: Floating labels, inline error messages, password/PIN masking, active typing cues.
     - **Card & Surface**: Solid content panels, elevated surfaces, subtle glass borders.
     - **Dialog / Modal**: Softly blurred backdrop, solid content container, accessible escape and focus traps.
     - **Toast / NotificationBanner**: Translucent glass, status icons, auto-dismiss.
     - **StatusIndicator & Badge**: Success, Warning, Error, Info indicators.
     - **ProgressRing**: SVG circular progress indicator with stage text in center.
     - **Skeleton / Loading**: Smooth shimmer placeholder.
* **Files Likely to Change**:
  - `frontend/src/components/ui/Button.tsx`
  - `frontend/src/components/ui/Modal.tsx`
  - `frontend/src/components/ui/Keypad.tsx`
  - `frontend/src/components/ui/Input.tsx` (new)
  - `frontend/src/components/ui/ProgressRing.tsx` (new)
  - `frontend/src/components/ui/Toast.tsx` (new)
  - `frontend/src/components/ui/Badge.tsx` (new)
* **Verification Plan**:
  - Verify every component renders in both light and dark themes.
  - Component tests in `frontend/src/test/`.
  - Check keyboard focus rings on all interactive elements.

---

### Phase 3 — Application Shell and Navigation
* **Objective**: Refine the application shell to support modern private banking navigation while preserving the ATM chassis experience.
* **Scope**:
  1. Desktop Shell:
     - Collapsible glass sidebar (`expanded` shows labels, `collapsed` shows icons only).
     - Active state: Slim emerald indicator line with highlighted icon and text (no heavy background fill).
     - Floating glass header: APEX wordmark/emblem, current page title, theme toggle, sound toggle, profile pill.
  2. Mobile Shell:
     - Floating glass bottom-navigation capsule (`~44-48px` touch targets).
     - Active item displays icon and label; inactive items display icon.
  3. Seamless Dual-Mode Experience:
     - Kiosk Mode: Preserves the authentic recessed ATM screen and side bezel keys (`L1-L4`, `R1-R4`) for transactions.
     - Portal Mode: Expanded banking view for dashboard, history, and settings.
* **Files Likely to Change**:
  - `frontend/src/components/layout/AtmKiosk.tsx`
  - `frontend/src/components/layout/Sidebar.tsx` (new)
  - `frontend/src/components/layout/BottomNavigation.tsx` (new)
  - `frontend/src/components/layout/Header.tsx` (new)
  - `frontend/src/App.tsx`
* **Verification Plan**:
  - Test responsive reflow across 320px, 375px, 768px, 1024px, 1440px viewports.
  - Ensure route transitions maintain existing state and do not disrupt active sessions.

---

### Phase 4 — Dashboard
* **Objective**: Implement the comprehensive banking dashboard specified in Style Guide §7 using real backend data.
* **Scope**:
  1. **Account Overview**:
     - Premium account cards displaying Account Type (`Savings Account` / `Current Account`), masked account number (`ACC••••1001`), available balance with Indian currency formatting (`₹5,000.00`), and a toggleable balance privacy eye icon.
  2. **Prominent ATM Launch Panel**:
     - Hero panel featuring hardware terminal illustration, readiness status (`ONLINE`), supported denominations badge, and prominent "Launch ATM Experience" action.
  3. **Financial Insights (Data-Grounded)**:
     - Real balance trend and credits vs. debits chart derived strictly from `GET /api/transactions/recent`. Honest empty states when history is sparse (no fake placeholder charts).
  4. **Recent Activity Timeline**:
     - Grouped by date with credit/debit indicators, icons, formatted timestamps, and transaction references.
* **Files Likely to Change**:
  - `frontend/src/pages/DashboardPage.tsx`
  - `frontend/src/components/cards/AccountCard.tsx` (new)
  - `frontend/src/components/transactions/TransactionTimeline.tsx` (new)
* **Verification Plan**:
  - Verify account balance matches database value.
  - Verify deposit/withdrawal updates dashboard numbers immediately after transaction.

---

### Phase 5 — Authentication and Security
* **Objective**: Refine the authentication experience into the centered premium banking card composition with tactile PIN entry.
* **Scope**:
  1. Login Composition:
     - Centered glassmorphic card on subtle navy gradient/ivory canvas.
     - Brand emblem and "APEX Touch Banking" wordmark.
     - Demo card selector tabs and manual card entry.
  2. PIN Verification:
     - Large central masked PIN display.
     - Tactile numeric keypad with depth, shadows, and click audio.
     - Inline validation messages with clear error recovery paths.
  3. Session Security:
     - Top floating notification countdown banner in the final 20 seconds.
     - "Stay Logged In" reset button and immediate session termination button.
* **Files Likely to Change**:
  - `frontend/src/pages/WelcomePage.tsx`
  - `frontend/src/pages/PinPage.tsx`
  - `frontend/src/context/AuthContext.tsx`
  - `frontend/src/components/ui/Keypad.tsx`
* **Verification Plan**:
  - Test valid PIN (`1234`) &rarr; successful session creation.
  - Test invalid PIN (`0000`) &rarr; remaining attempts warning.
  - Test 3 invalid attempts &rarr; card locked message.
  - Test session timeout &rarr; auto-ejection.

---

### Phase 6 — ATM Experience
* **Objective**: Transform ATM transactions into a guided, step-by-step terminal interaction with review, confirmation, and explicit processing states.
* **Scope**:
  1. **ATM Welcome Screen**:
     - Cinematic navy/cyan background, glowing readiness indicators, card insertion call-to-action.
  2. **Horizontal Transaction Progress Indicator**:
     - Steps: Selection &rarr; Amount &rarr; Review &rarr; Processing &rarr; Complete.
  3. **Separate Review & Confirmation Screen**:
     - Distinct review screen before transaction submission showing exact amount, source account, and transaction type.
  4. **Circular Processing Progress Ring**:
     - Explicit stages (`Validating`, `Authorizing`, `Completing`) tied to real backend request resolution.
  5. **Status-Focused Result Screen**:
     - Large success/failure badge, transaction ID, remaining balance, and clear next steps ("Take Receipt", "New Transaction", "Eject").
* **Files Likely to Change**:
  - `frontend/src/pages/WithdrawPage.tsx`
  - `frontend/src/pages/DepositPage.tsx`
  - `frontend/src/pages/TransferPage.tsx`
  - `frontend/src/pages/BalancePage.tsx`
  - `frontend/src/components/atm/ATMProgress.tsx` (new)
* **Verification Plan**:
  - Full financial flow verification: Withdraw ₹500, Deposit ₹1,000, Transfer ₹200.
  - Test cancellation at review stage returns cleanly to dashboard without altering balance.

---

### Phase 7 — ATM Hardware Simulation
* **Objective**: Elevate hardware console components with authentic tactile feedback strictly synchronized with backend truth.
* **Scope**:
  1. **Card Reader Bay**:
     - Smooth motorized insertion and ejection animations synchronized with session authentication state.
  2. **Cash Dispenser Shutter**:
     - Motorized shutter opening, banknote emergence animation, and "Collect Cash" prompt.
     - Notes rendered reflect exact greedy breakdown (₹500, ₹200, ₹100).
     - Cash is marked collected only when user clicks/taps the note stack.
  3. **Thermal Receipt Printer**:
     - Serrated thermal paper feed animation.
     - Digital receipt slip with APEX branding, IBM Plex Mono transaction data, and native PDF print action.
  4. **Sound Synthesis**:
     - Web Audio API clicks, mechanical roller whirrs, and confirmation chords.
     - Persisted sound mute toggle in header and mobile drawer.
* **Files Likely to Change**:
  - `frontend/src/components/atm/HardwareConsole.tsx`
  - `frontend/src/components/atm/CardSlot.tsx`
  - `frontend/src/components/atm/CashDispenserSlot.tsx`
  - `frontend/src/components/atm/ReceiptPrinterSlot.tsx`
  - `frontend/src/utils/sound.ts`
* **Verification Plan**:
  - Verify cash animation displays only after `200 OK` from `api.withdraw()`.
  - Verify receipt shows accurate transaction ID, timestamp, and remaining balance.
  - Verify sound remains completely silent when muted.

---

### Phase 8 — Transaction History, Accounts and Settings
* **Objective**: Implement filterable transaction audit history, account breakdown, and dedicated settings categories.
* **Scope**:
  1. **Transaction Timeline**:
     - Date grouping (`Today`, `Yesterday`, `Earlier this month`).
     - Type badges (Deposit, Withdrawal, Transfer In, Transfer Out).
     - Masked accounts, note breakdown chips, and thermal reprint trigger.
  2. **Account Details**:
     - Account number, account type, customer name, email, phone, minimum balance rules.
  3. **Dedicated Settings Layout**:
     - Category tabs: **Account**, **Preferences** (Language, Sound), **Security** (PIN Change, Failed Attempts), **Appearance** (Light, Dark, System).
* **Files Likely to Change**:
  - `frontend/src/pages/HistoryPage.tsx`
  - `frontend/src/pages/ChangePinPage.tsx`
  - `frontend/src/pages/SettingsPage.tsx` (new)
  - `frontend/src/App.tsx`
* **Verification Plan**:
  - Verify changing PIN from settings succeeds with BCrypt update.
  - Verify transaction history displays all completed transactions in chronological order.

---

### Phase 9 — Responsive Design and Accessibility
* **Objective**: Complete exhaustive responsive layout audit and WCAG 2.2 AA accessibility validation across all viewports.
* **Scope**:
  1. Viewport Testing Matrix:
     - Narrow Mobile (320px–360px)
     - Standard Mobile (375px–430px)
     - Tablet (768px–834px)
     - Laptop / Desktop (1024px–1440px+)
  2. Touch Targets & Ergonomics:
     - Guarantee minimum 44×44px hit targets on all interactive controls.
     - Zero horizontal scrolling or container overflow.
  3. Accessibility & Keyboard Navigation:
     - Visible focus rings with Electric Cyan accent.
     - Full keyboard navigation: <kbd>Tab</kbd>, <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>Esc</kbd>.
     - Proper ARIA landmarks, roles, and live region announcements.
     - Respect `prefers-reduced-motion` media query.
* **Files Likely to Change**:
  - Global responsive rules across all page and component files.
* **Verification Plan**:
  - Chrome DevTools device mode audit at 320px, 375px, 768px, 1024px.
  - Lighthouse accessibility score validation.

---

### Phase 10 — Complete QA, Build & Stabilisation
* **Objective**: Perform comprehensive full-stack end-to-end regression testing, build verification, and prepare final documentation.
* **Scope**:
  1. Execute full backend test suite (`.\mvnw.cmd test` - 34 tests).
  2. Execute full frontend test suite (`npm test -- --run`).
  3. Execute production Vite build (`npm run build`).
  4. Perform security audit (zero plaintext credentials, masked accounts, safe error messages).
  5. Generate final QA report (`docs/FINAL_QA_REPORT.md`) and implementation summary (`docs/IMPLEMENTATION_SUMMARY.md`).
* **Verification Plan**:
  - 100% automated test pass rate.
  - Zero build errors or warnings.
  - Project ready for user acceptance and production cloud deployment.

---

## 4. Phase Gate Approval Protocol

To maintain total control and project safety:
1. **Never jump ahead**: Phases must be executed strictly in order (Phase 1 &rarr; Phase 2 &rarr; ... &rarr; Phase 10).
2. **Phase Completion Report**: At the end of every phase, a structured report will be delivered detailing:
   - What was implemented.
   - Files created or modified.
   - Tests performed and results.
   - Known issues and risk status.
   - Approval request.
3. **Wait for Approval**: No code modifications for the next phase will begin until explicit user approval is granted.

