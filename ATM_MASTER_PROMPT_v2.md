# MASTER PROMPT v2 — PREMIUM JAVA ATM SIMULATION SYSTEM

You are acting as a Principal Software Architect, Senior Java Developer, Senior Frontend Engineer, UI/UX Designer, QA Engineer and Technical Project Manager.

Goal: upgrade my existing Java OOP ATM Simulation System into a realistic, fully working, premium ATM application: a Java backend with real banking logic, plus a React frontend that feels like a physical modern ATM terminal. This is an academic OOP project, so the Java code must clearly demonstrate OOP principles and I must be able to explain it in a viva.

Execute the project yourself. Do not just describe it.

---

## 0. HOW TO READ THIS PROMPT (precedence and conflicts)

1. Existing repository code and behaviour come first. Preserve what works.
2. Then this prompt's requirements.
3. If two instructions conflict, or something here contradicts what the repository actually contains, do NOT guess silently. Choose the safest option, record the decision in `PROJECT_PROGRESS.md` under "Decisions", and continue. Ask me only if the decision is irreversible or cannot be inferred from the repository.
4. Never claim something was done, tested, committed or pushed unless you verified it by actually running the command and reading its output.

---

## 1. REPOSITORY AND GIT SAFETY

Primary repository: https://github.com/shini21/atm_system

Before changing anything, run `git remote -v`, `git status`, `git branch -a` and `git log --oneline -20`.

- If the local `origin` differs from the URL above, STOP and report both URLs and ask me which one to use. (My earlier notes mention a course repo, `Course-Project-VIT/OOP-CP`, with the Eclipse project at `D:\College\CP\OOP-CP`. Do not assume which is correct.)
- Work inside the existing repository. Do not create a new one.
- Create and work on a branch named `feature/premium-atm`. Do not commit directly to `main`/`master`. Push the branch after every phase. I will merge it myself.
- Never use `git push --force`, `git reset --hard` on shared history, or anything that discards my uncommitted changes. If the working tree is dirty at the start, report it and stash or commit separately before proceeding.
- If a push fails (auth, rejected, network), keep the local commit, report the exact error, and continue with the next phase locally. Do not loop retrying.
- Add a proper `.gitignore` (Java/Maven/Eclipse/IntelliJ `target/`, `bin/`, `.classpath`-safe handling, `node_modules/`, `dist/`, `.env*`, `*.db`, logs). Never commit secrets, build output or database files.

---

## 2. SKILLS AND TOOLS (Anti-gravity environment)

At the start of Phase 0:

1. List every skill actually installed. Read the `SKILL.md` (or equivalent) of each skill that is relevant.
2. Use the relevant skills during the work, not just in documentation. Re-read the relevant skill when starting a new phase, when hitting a related problem, and when resuming after a context reset.
3. **UI/UX Pro Max** is expected for the frontend (design system, palette, typography, spacing, component states, accessibility, responsive rules). If it is NOT installed, say so in Phase 0, state what you will use instead, and continue. Do not pretend to use it.
4. Also look for skills covering: React/TypeScript, Tailwind, Motion/animation, Java/Spring, REST design, database design, testing, debugging, code review, documentation and Git.
5. Never invent a skill. Do not install duplicates.
6. Create and maintain `SKILLS_AUDIT.md` with columns: Skill | Purpose | Phase used | Status (Used / Planned / Not available) | Notes on what it changed in the project.

---

## 3. TECHNOLOGY DECISIONS

### Backend — Java only
- Java version: use the version the project already uses (detect it). If none, use 17+.
- Build system: detect the existing one. The project may be a plain Eclipse project with no Maven/Gradle. If so, add a Maven `pom.xml` in a way that does not break opening the project in Eclipse (keep the standard `src/main/java` layout, or document any move clearly), and record this as a Decision.
- Spring Boot for the REST layer (Spring Web, Validation, Data JPA).
- Persistence: default to an embedded **H2 file database** so the project runs with zero setup. Make the datasource configurable so MySQL can be used via a Spring profile (`application-mysql.yml`) without code changes. Schema via JPA/Flyway; seed demo data on first run.
- Money: `BigDecimal` only, scale 2, `RoundingMode.HALF_UP`. No float/double anywhere in financial logic.
- All authentication, validation, balance changes, limits and transaction processing happen in Java. No business logic in JavaScript. No mock backend. No Python/Node backend.
- Keep the original console ATM runnable as a second entry point if it exists (do not delete it). The REST backend and console app should share the same domain/service classes where practical.

### Frontend (presentation and API calls only)
React + Vite + TypeScript + Tailwind CSS + Motion for React (Framer Motion) + Lucide React. Optional, used sparingly and only where they serve a purpose: React Bits, Aceternity UI, Magic UI. Do not stack libraries for effect.

---

## 4. DOMAIN AND OOP REQUIREMENTS

Inspect the existing classes first and reuse them. Target package layout (adapt to what exists): `model/entity`, `repository`, `service`, `controller`, `dto`, `exception`, `validation`, `config`, `security`.

Demonstrate these meaningfully (not decoratively):
- **Encapsulation**: private state, controlled access, no public setters on balance/PIN hash.
- **Inheritance + Polymorphism**: abstract `Account` with `SavingsAccount` and `CurrentAccount` (and optionally others) overriding rules such as minimum balance, daily withdrawal limit, overdraft, transfer limit. Transaction processing must call these overridden rules at runtime.
- **Abstraction**: interfaces for services/repositories and a `Transaction` hierarchy (Withdrawal, Deposit, Transfer, PinChange or similar) where it genuinely helps.
- **SOLID**: small single-purpose classes; no god classes; depend on interfaces.
- **Exceptions**: custom checked/unchecked exceptions for invalid PIN, insufficient balance, invalid amount, blocked card, expired card, account not found, limit exceeded, ATM out of cash, denomination cannot be dispensed, session expired, duplicate transaction, transaction failure. A global `@RestControllerAdvice` maps them to consistent JSON errors with stable error codes.

### Banking rules (define these explicitly and enforce them in Java)
- Currency ₹ (INR). Store timestamps in UTC, display in IST.
- Denominations available in the ATM: ₹100, ₹200, ₹500 (do not use ₹2000 notes). Withdrawals must be multiples of ₹100; the ATM computes a note breakdown from its **actual cash inventory** (persisted per denomination) and rejects amounts it cannot dispense exactly. Dispensing decrements inventory. Deposits increase inventory by the counted notes.
- Limits (configurable, defaults): per-transaction withdrawal ₹20,000; daily withdrawal per account (type-specific); minimum balance per account type; per-transfer and daily transfer limit.
- Cards: 3 consecutive wrong PINs block the card (persisted). Expired and blocked cards are rejected before PIN check. A successful login resets the failed counter. Provide a documented demo-only way to unblock a card (e.g. a reset script or admin endpoint guarded by a config flag) so the demo can be repeated.
- Transfers: must be atomic (single DB transaction), reject self-transfer, validate the beneficiary exists and is active, lock accounts in a consistent order to avoid deadlocks, and produce a reference number.
- Idempotency: every money-moving request carries a client-generated idempotency key; a repeated key returns the original result and does not move money twice.
- Every transaction (including failed ones where relevant) is recorded with: id/reference, timestamp, type, debit/credit, amount, balance after, status, ATM id, and for withdrawals the note breakdown.

---

## 5. SECURITY

- PINs stored as **BCrypt hashes** only. Never log, return or echo a PIN. Never store full card numbers in logs; mask in API responses (e.g. `XXXX XXXX XXXX 1234`; account `XXXXXX7890`).
- Login returns a short-lived signed session token (JWT or opaque server-side session). Every ATM endpoint except login requires it. A session may only access its own account.
- Idle session timeout (default 60s of inactivity, configurable) with a visible countdown warning in the UI; the backend must also reject expired sessions. Logout invalidates the session server-side.
- Bean Validation on all DTOs, plus frontend validation. Server is the authority.
- CORS restricted to the dev frontend origin via config. Basic rate limiting on the login endpoint.
- Secrets (JWT secret, DB credentials) come from environment variables or an untracked config file, with a committed `.env.example`. Seed demo PINs may appear in the README as clearly labelled **demo-only** credentials; they must be stored hashed in the database.

---

## 6. REST API (document every endpoint in `API_DOCUMENTATION.md`)

Suggested, adapt as needed: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/session`, `GET /api/account/summary`, `GET /api/account/balance`, `POST /api/transactions/withdraw`, `POST /api/transactions/deposit`, `POST /api/transactions/transfer`, `GET /api/transactions` (filters: type, date range, status, paging), `GET /api/transactions/mini-statement`, `POST /api/account/pin/change`, `GET /api/transactions/{id}/receipt`, `GET /api/atm/status` (cash availability, no sensitive data).

Receipt content (bank name, reference, date/time, type, masked account, amount, balance, status, and denominations for withdrawals) is produced by the backend. The frontend renders it and offers print/download (browser print-to-PDF or a generated PDF).

Consistent JSON error shape: `{ code, message, timestamp, path }`. Use correct HTTP status codes.

---

## 7. FRONTEND AND EXPERIENCE

Build it as an **ATM terminal**, not a dashboard with an ATM label. Concretely: a framed screen with a surrounding terminal body (card slot, keypad area, cash dispenser tray, receipt slot, side function keys) that adapts responsively; on tablet/small widths it collapses gracefully to a screen-first layout.

Screens/flows (all wired to real endpoints):
1. Welcome: bank branding, language selection (English + Hindi for UI strings), card selection/insertion animation, instructions.
2. Authentication: animated custom keypad, masked PIN dots, Enter/Clear/Cancel, attempts-remaining feedback, blocked/expired card messages, physical keyboard support.
3. Main menu: customer name, account type, masked account number, session timer, and the nine operations (Withdraw, Deposit, Balance Inquiry, Fund Transfer, Mini Statement, PIN Change, Transaction History, Receipt, Eject Card/Logout).
4. Withdrawal: preset + custom amount, server-side validation, processing animation, cash dispensing animation driven by the **note breakdown returned by Java**, success screen, optional receipt.
5. Deposit: amount entry, cash insertion and counting animation, confirmation, updated balance, receipt option.
6. Transfer: beneficiary entry/selection, server-side beneficiary check, confirmation screen, reference number, receipt.
7. Balance inquiry, mini statement, history (filters + clean table/timeline).
8. PIN change: current → new → confirm.
9. Receipt: print-slot reveal animation, print/download.
10. Session timeout, cancel at any step, eject card animation, return to welcome.

Design rules:
- Minimal luxury / private-banking tone. Restrained palette, strong type hierarchy, consistent spacing scale, subtle depth. Light and dark theme, switchable everywhere, persisted.
- Avoid: generic purple-blue gradients, heavy glassmorphism, card-grid dashboards, stock illustrations, oversized headings, gratuitous floating elements.
- Define design tokens (colors, type scale, spacing, radius, shadows, motion durations/easings) in one place (Tailwind config + CSS variables) before building screens. Record them in the README or a `DESIGN_SYSTEM.md`.
- Every component has hover, focus-visible, active and disabled states.
- Motion: spring-based, consistent timing, purposeful (screen transitions, keypad press, PIN dot fill, card insert/eject, processing, cash dispense/count, receipt print, success/failure). Respect `prefers-reduced-motion`. Animations must never block or delay a result the user needs.
- Accessibility: WCAG AA contrast, full keyboard operation, ARIA labels, `aria-live` for status and errors, focus management on screen change.
- State: a typed API client layer (central base URL from env, typed responses, runtime response validation, error mapping), and an auth/session store. No balances or transaction results hardcoded or simulated in React. If the backend is unreachable, show a real error state; never fake success.
- Every visible button must do something real. If a feature is not finished, say so in the UI and in `PROJECT_PROGRESS.md`; do not ship dead buttons or placeholder screens.

---

## 8. DEMO DATA

Seed at least: 3 normal customers (savings and current, different balances), 1 low-balance account, 1 blocked card, 1 expired card, and an ATM cash inventory with realistic note counts. Include one case that cannot be dispensed exactly with the current inventory so that scenario is demonstrable. Document all demo cards/PINs (demo-only) in the README.

---

## 9. TESTING (run it for real and report actual results)

Backend (JUnit 5 + Mockito + Spring MockMvc/SpringBootTest): login success; wrong PIN; three failures block card; blocked and expired card; withdrawal success; insufficient balance; limit exceeded; amount not a multiple of 100; ATM cash shortage; undispensable amount; deposit success and invalid amount; transfer success; invalid/self transfer; atomic rollback on failure; duplicate idempotency key; PIN change; history and filters; expired session rejected; unauthorized access to another account rejected; concurrent withdrawals do not overdraw.

Frontend (Vitest + React Testing Library; Playwright for one end-to-end happy path if feasible): navigation, keypad/PIN flow, form validation, API error and loading states, theme switching, responsive layout.

Final phase must include a manual end-to-end run of every transaction flow against the running backend. Report which tests were run, the command used, and the real pass/fail counts.

---

## 10. DOCUMENTATION

- `README.md`: overview, features, stack, architecture, prerequisites, one-command-per-side setup, backend and frontend start instructions (ports, env), demo credentials, how to run tests, screenshots when available.
- `API_DOCUMENTATION.md`: every endpoint, method, auth requirement, request/response examples, error codes.
- `PROJECT_PROGRESS.md`: after every phase, record completed tasks, files created/modified, tests run and results, commit hash, push status, known issues, decisions made, next phase, and the exact next step. A new developer or AI agent must be able to continue from this file alone.
- `SKILLS_AUDIT.md`: see section 2.
- `OOP_CONCEPTS.md`: for each OOP principle, name the exact classes/methods that demonstrate it, with a short explanation and a class diagram (Mermaid is fine). This is for my viva.

---

## 11. PHASES (each ends with: run tests → review diff → confirm no secrets/build files → update PROJECT_PROGRESS.md → commit → push → verify push)

Each phase has a "done when" gate. Do not move on until it is met or the blocker is documented.

- **Phase 0 — Audit.** Inspect repo, Git state, build system, Java version, existing classes and gaps, installed skills. Create `SKILLS_AUDIT.md` and `PROJECT_PROGRESS.md`. Output the Phase 0 report (below). *Done when:* the report is written and the repo/remote question in section 1 is resolved.
- **Phase 1 — Backend architecture.** Packages, domain model with inheritance/polymorphism, exceptions, DTOs, persistence, seed data. *Done when:* app boots against H2 and seed data loads.
- **Phase 2 — Core ATM services + REST API.** Auth/session, balance, withdraw (with denominations), deposit, transfer, history, PIN change, receipts, ATM status. *Done when:* every endpoint works via a real HTTP call.
- **Phase 3 — Backend tests and hardening.** Section 9 backend list. *Done when:* all green; bugs found are fixed.
- **Phase 4 — Frontend foundation.** Vite + React + TS + Tailwind + Motion, design tokens, theme system, API client. *Done when:* app builds and themes switch.
- **Phase 5 — ATM interface.** Terminal chassis, welcome, card insertion, keypad, authentication, main menu.
- **Phase 6 — Transaction screens + hardware simulation.** All flows, dispensing/counting/receipt animations, timeout, eject.
- **Phase 7 — Integration verification.** Every operation exercised end-to-end against Java; loading/error states verified.
- **Phase 8 — Polish.** Responsive, accessibility, reduced motion, error/empty states, performance.
- **Phase 9 — Final testing and docs.** Full test run, README/API docs/OOP_CONCEPTS finalized, repository verified on GitHub.

Suggested commit messages (adjust to reality): `chore: audit repository and add progress/skills docs`, `refactor: organise Java domain and service architecture`, `feat: implement ATM auth and session management`, `feat: implement withdraw/deposit with denomination handling`, `feat: implement transfers, history, receipts and PIN change`, `test: add backend test suite`, `feat: scaffold React frontend and design system`, `feat: implement ATM terminal UI and authentication`, `feat: implement transaction flows and hardware animations`, `feat: integrate frontend with Java API`, `style: polish responsiveness, accessibility and themes`, `docs: finalise documentation`.

---

## 12. WORKING RULES

- **Phase 0 deliverable (write it, then continue straight into Phase 1 without waiting for me, unless a blocker needs my answer):** repository structure; existing Java analysis; current vs missing functionality; installed skills report; recommended architecture; frontend/backend integration approach; phase plan; technical risks.
- Do not generate a replacement project, and do not start with random UI components before the audit is done.
- Make ordinary engineering decisions yourself. Ask only for information that cannot be derived from the repo or this prompt.
- Keep chat replies short: what changed, test results, commit hash, push status, next step. Put detail in the docs, not in the chat.
- Priorities when trade-offs appear: correctness of the Java backend > integration works end to end > Java OOP clarity > design quality > animation polish > performance.
- No placeholder pages, dead buttons, hardcoded fake results, TODOs in core logic, or unimplemented core operations. If something cannot be finished, report it honestly.

### Context / token limit protocol
When approaching a context limit, stop at a stable checkpoint: finish or safely isolate the current task, run tests, commit, push, and update `PROJECT_PROGRESS.md` with files changed, remaining tasks, unresolved errors, and the exact next command or step. Then end the reply with a `PROJECT CHECKPOINT` block.

When I say **"Continue"** (or when resuming in a new session): read `PROJECT_PROGRESS.md`, run `git status` and `git log -5`, re-read the relevant skills, and resume from the exact unfinished step without redoing completed work or duplicating files.

---

## FINAL OBJECTIVE

A complete, integrated ATM simulation: a Java OOP backend with correct banking logic and secure sessions, a premium animated ATM-terminal frontend wired to it, realistic hardware simulation driven by real backend results, tests that were actually run, full documentation, and a clean Git history pushed phase by phase on a feature branch.

Correctness first. Real backend, no fakes. No generic AI-looking UI. No abandoned phases.
