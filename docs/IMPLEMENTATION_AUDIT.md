# APEX Touch Banking — Implementation Audit & Repository Baseline

**Document Version:** 1.0.0  
**Phase:** Phase 0 — Repository Audit and Baseline  
**Date:** November 14, 2026  
**Auditor:** Principal Software Architect & Full-Stack Engineering Team  

---

## 1. Executive Summary

This audit establishes the comprehensive technical baseline of the **APEX Touch Banking / ATM Simulation System** prior to implementing the *APEX Theme and UI Style Guide* (`APEX_Theme_and_UI_Style_Guide.docx`).

The project is an enterprise-grade full-stack banking simulation consisting of:
1. **Java 17 Spring Boot 3 REST Backend**: Robust Object-Oriented domain layer implementing Abstraction, Polymorphism, Interfaces, Checked Exceptions, BCrypt PIN security, and JPA embedded persistence (`atm_db.mv.db`).
2. **React 19 + TypeScript + Vite Web Frontend**: High-fidelity touchscreen terminal UI utilizing Tailwind CSS, Motion for React, and Web Audio API synthesis.
3. **Stand-Alone Academic Console Application**: Coexists in `src/com/bank/atm/Main.java`, sharing identical domain models and business rules.

---

## 2. Technology Stack & Framework Inventory

### 2.1 Frontend Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Core Framework** | React | `19.3.1` | View layer, component state, hooks |
| **DOM Renderer** | React DOM | `19.3.1` | Browser DOM reconciliation |
| **Routing** | React Router DOM | `7.18.5` | Client-side routing, protected route guards |
| **Build Tool & Dev Server**| Vite | `8.3.6` | Fast HMR dev server, Rollup production bundler |
| **Language** | TypeScript | `~7.0.2` | Strict typing, interface contracts |
| **Styling** | Tailwind CSS | `^3.4.17` | Utility-first styling with CSS custom properties |
| **PostCSS / Autoprefixer**| PostCSS / Autoprefixer | `8.5.32` / `10.6.2` | CSS vendor prefixing and modern syntax |
| **Animations & Gestures** | Motion for React (`motion`)| `^14.10.1` | Spring animations, gestures, layout transitions |
| **Iconography** | Lucide React | `^1.70.0` | Outlined SVG icon set |
| **HTTP Client** | Axios | `^1.21.0` | REST API communication, session cookie transport |
| **Testing Engine** | Vitest | `^5.1.0` | Unit and component test runner |
| **DOM Testing Library** | `@testing-library/react` | `^16.3.3` | User event simulation, DOM assertions |
| **Environment Simulation** | JSDOM | `^31.0.1` | Headless DOM environment for Vitest |

### 2.2 Backend Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Language** | Java | `17 LTS` (OpenJDK / Eclipse Temurin) | OOP domain core, REST API |
| **Framework** | Spring Boot | `3.3.4` | Dependency injection, Web MVC, configuration |
| **Persistence / ORM** | Spring Data JPA / Hibernate | `6.5.3.Final` | Repository abstraction, entity mapping |
| **Embedded Database** | H2 Database | `2.2.224` | Local file-based SQL persistence (`./data/atm_db`) |
| **Security Cryptography** | Spring Security Crypto | `6.3.3` | BCrypt password hashing (`BCryptPasswordEncoder`) |
| **Web Server** | Embedded Apache Tomcat | `10.1.30` | HTTP servlet container, session manager |
| **Logging** | SLF4J / Logback | `2.0.16` | Audit logging, security event tracking |
| **Testing Engine** | JUnit 5 (Jupiter) | `5.10.3` | Unit, integration, and MockMvc test runner |
| **Build Automation** | Maven Wrapper (`mvnw`) | `3.9.9` | Hermetic cross-platform Java build |
| **Containerization** | Docker (Multi-stage) | Alpine Linux | Temurin 17 JRE production runtime |

---

## 3. Architecture & Codebase Layout

### 3.1 Repository Directory Structure

```text
atm_system/
├── .agent/skills/                   # Local specialized agent skills (ui-ux-pro-max, brand, etc.)
├── docs/                            # Phased implementation master documentation
│   ├── IMPLEMENTATION_AUDIT.md      # Baseline audit (this document)
│   ├── IMPLEMENTATION_ROADMAP.md    # Phased design-to-code execution plan
│   └── IMPLEMENTATION_PROGRESS.md   # Dynamic state tracking across phases
├── frontend/                        # React 19 Touchscreen Application
│   ├── public/                      # Static assets (favicon.svg, icons.svg)
│   ├── src/
│   │   ├── animations/              # Framer/Motion variant definitions and easing curves
│   │   ├── components/
│   │   │   ├── atm/                 # Physical ATM console components (CardSlot, Dispenser, Keypad)
│   │   │   ├── cards/               # TiltedATMCard, SpotlightCard
│   │   │   ├── layout/              # AtmKiosk, ATMTransition, AnimatedBackground
│   │   │   ├── transactions/        # TransactionItem row presentation
│   │   │   └── ui/                  # Button, Keypad, Modal, NumberTicker, Toggles
│   │   ├── context/                 # AuthContext, HardwareContext, LanguageContext, ThemeContext
│   │   ├── pages/                   # 11 Route views (Welcome, Pin, Dashboard, Withdraw, etc.)
│   │   ├── services/                # Axios API client (api.ts)
│   │   ├── styles/                  # Custom CSS animations (animations.css)
│   │   ├── test/                    # Vitest suites (AtmTerminal.test.tsx, setup.ts)
│   │   ├── types/                   # TypeScript interfaces (ApiResponse, AuthSession, etc.)
│   │   └── utils/                   # Sound synthesizer (Web Audio API), demo card catalog
│   ├── index.html                   # HTML entrypoint with viewport, SEO, OG tags
│   ├── package.json                 # Node manifest
│   ├── tailwind.config.js           # Tailwind theme configuration
│   ├── tsconfig.json                # TypeScript project configuration
│   ├── vercel.json                  # Vercel SPA rewrite rules and cache headers
│   └── vite.config.ts               # Vite configuration with /api reverse proxy
├── resources/                       # Backend Spring Boot properties
│   ├── application.properties       # Default H2, session, and CORS properties
│   └── application-mysql.properties # Optional production MySQL configuration
├── src/com/bank/atm/                # Clean Java OOP package root
│   ├── config/                      # BankConfig, DataInitializer, WebMvcConfig
│   ├── controller/                  # AuthController, AccountController, TransactionController, AtmHardwareController
│   ├── dto/request/                 # Inbound JSON request envelopes
│   ├── dto/response/                # Outbound standardized ApiResponse<T> envelopes
│   ├── entity/                      # JPA Database entities (AccountEntity, CardEntity, etc.)
│   ├── enums/                       # TransactionType enum
│   ├── exceptions/                  # Domain checked exceptions & GlobalExceptionHandler
│   ├── interfaces/                  # Authenticatable, Printable, TransactionOperations
│   ├── model/                       # Domain models (Account, SavingsAccount, CurrentAccount, Card, etc.)
│   ├── repository/                  # Spring Data JPA repositories
│   ├── security/                    # PinSecurityService (BCrypt)
│   ├── service/                     # Domain & Web services (ATM, Bank, AtmPersistenceService, etc.)
│   ├── util/                        # InputValidator
│   ├── AtmApplication.java          # Spring Boot main entrypoint
│   └── Main.java                    # Stand-alone academic console ATM entrypoint
├── test/com/bank/atm/               # 34 JUnit 5 backend automated test classes
├── Dockerfile                       # Multi-stage container definition
├── pom.xml                          # Maven build definition (Java 17, Spring Boot 3.3.4)
├── DEPLOYMENT_GUIDE.md              # Cloud deployment guide (Vercel + Render)
├── ARCHITECTURE.md                  # Comprehensive OOP and technical architecture reference
└── README.md                        # Master project documentation
```

---

## 4. Java Backend OOP Contracts & Responsibilities

The Java backend serves as the **authoritative source of truth** for all business rules, calculations, and security gates.

```
                      ┌──────────────────────┐
                      │    <<interface>>     │
                      │TransactionOperations │
                      └──────────▲───────────┘
                                 │
                      ┌──────────┴───────────┐
                      │   abstract Account   │
                      └─────▲──────────▲─────┘
                            │          │
             ┌──────────────┴───┐  ┌───┴──────────────┐
             │  SavingsAccount  │  │  CurrentAccount  │
             │ (Min Bal: ₹100)  │  │  (Min Bal: ₹0)   │
             └──────────────────┘  └──────────────────┘
```

### 4.1 Abstraction & Inheritance
* **`Account` (Abstract Class)**:
  - Defines the core banking state: `accountNumber`, `Customer customer`, `BigDecimal balance`, `List<TransactionRecord> transactionHistory`.
  - Enforces atomic transaction recording and state mutators.
  - Template method `withdraw(BigDecimal amount)` delegates minimum balance verification to abstract hook `ensureSufficientFunds(BigDecimal amount)`.
* **`SavingsAccount`**:
  - Implements `ensureSufficientFunds`: Requires remaining balance $\ge \text{₹100.00}$.
* **`CurrentAccount`**:
  - Implements `ensureSufficientFunds`: Requires remaining balance $\ge \text{₹0.00}$ (zero minimum balance).

### 4.2 Interfaces
* **`Authenticatable`**: Contract for credential verification (`validatePin(String pin)`, `isBlocked()`, `recordFailedAttempt()`, `resetFailedAttempts()`). Implemented by `Card`.
* **`Printable`**: Contract for formatted receipts, slips, and audit logs (`getReceiptString()`, `getMiniStatement()`). Implemented by `Account` and `TransactionRecord`.
* **`TransactionOperations`**: Contract defining `deposit(BigDecimal amount)`, `withdraw(BigDecimal amount)`, `transfer(Account target, BigDecimal amount)`.

### 4.3 Checked Domain Exceptions & Global Mapping
All financial failures trigger strongly-typed Java checked exceptions, mapped cleanly to HTTP status codes by `GlobalExceptionHandler`:
* `InvalidPinException` $\rightarrow$ `401 Unauthorized`
* `CardBlockedException` $\rightarrow$ `403 Forbidden`
* `CardExpiredException` $\rightarrow$ `400 Bad Request`
* `AccountNotFoundException` $\rightarrow$ `404 Not Found`
* `InsufficientFundsException` $\rightarrow$ `400 Bad Request` (includes available and requested amounts)
* `InvalidAmountException` $\rightarrow$ `400 Bad Request` (enforces positive amounts, max 2 decimals)
* `DataIntegrityViolationException` $\rightarrow$ `409 Conflict` (handles database constraints)

### 4.4 Cash Dispenser Algorithm
* Handled in `CashDispenserService.java`.
* Supported denominations: strictly **₹500**, **₹200**, and **₹100** (₹2,000 notes are strictly excluded).
* Limits: Minimum withdrawal ₹100, maximum ₹20,000 per transaction.
* Greedy note distribution algorithm calculates physical inventory deduction and returns denomination counts (`Map<Integer, Integer>`) to animate the hardware console.

---

## 5. API Endpoints & Request/Response Contracts

All API endpoints reside under `/api` and exchange standard JSON envelopes (`ApiResponse<T>`):

```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "timestamp": "2026-11-14T01:00:00.000000"
}
```

### 5.1 Endpoint Inventory

| HTTP Method | Endpoint URI | Request Body | Response Payload | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/card` | `{ "cardNumber": "CARD1001" }` | `CardStatusResponse` | Validates card existence, block status, expiry date |
| `POST` | `/api/auth/login` | `{ "cardNumber": "CARD1001", "pin": "1234" }` | `AuthSessionResponse` | Authorizes PIN via BCrypt; issues `JSESSIONID` |
| `GET` | `/api/auth/session` | _None_ | `AuthSessionResponse` | Validates existing session credentials |
| `POST` | `/api/auth/logout` | _None_ | `Void` | Invalidates active HTTP session |
| `POST` | `/api/auth/change-pin` | `{ "currentPin": "1234", "newPin": "5678", "confirmPin": "5678" }` | `Void` | Updates BCrypt hash after verifying current PIN |
| `GET` | `/api/account/details` | _None_ | `AccountDetailsResponse` | Returns account number, type, customer profile |
| `GET` | `/api/account/balance` | _None_ | `BalanceResponse` | Returns available balance and minimum balance |
| `POST` | `/api/transactions/deposit` | `{ "amount": 500.00 }` | `TransactionItemResponse` | Credits account balance; increments ATM inventory |
| `POST` | `/api/transactions/withdraw`| `{ "amount": 1000.00 }` | `TransactionItemResponse` | Debits balance; calculates note breakdown |
| `POST` | `/api/transactions/transfer`| `{ "recipientAccountNumber": "ACC1002", "amount": 500.00 }` | `TransactionItemResponse` | Atomic inter-account ledger transfer |
| `GET` | `/api/transactions/recent` | Query: `?limit=5` | `List<TransactionItemResponse>`| Retrieves descending transaction timeline |
| `GET` | `/api/atm/status` | _None_ | `Map<String, Object>` | Terminal model, cash available, denominations |
| `GET` | `/api/atm/health` | _None_ | `Map<String, Object>` | Healthcheck probe for Render container orchestrator |
| `POST` | `/api/atm/unblock` | Query: `?cardNumber=CARD1004` | `String` | Demo convenience unblock utility |

---

## 6. Authentication, Session & Security Architecture

1. **Session Management**:
   - HTTP session-backed state using standard `JSESSIONID`.
   - Inactivity auto-logout: 15-minute server expiration with client-side 60-second hardware session countdown warning at 20 seconds.
   - Cross-Origin HTTPS Support: Configured with `SameSite=${COOKIE_SAME_SITE:lax}` and `Secure=${COOKIE_SECURE:false}` (overridden to `SameSite=none; Secure=true` in production).
2. **PIN Security**:
   - BCrypt salted hashing (`PinSecurityService.java`).
   - Plaintext PINs are never stored in the database, never returned in API responses, and never logged.
   - Account lockout enforced upon 3 consecutive invalid attempts.
3. **Data Masking**:
   - Frontend and backend mask account numbers (`ACC••••1001`) and card numbers (`**** **** 1001`).

---

## 7. Current Application Routes & Screen Inventory

The application currently routes through `frontend/src/App.tsx`:

| Route Path | Page Component | Protected? | Current Layout / State |
|---|---|---|---|
| `/` | `WelcomePage.tsx` | No | ATM idle state, demo card selection, card slot animation |
| `/pin` | `PinPage.tsx` | No | Masked PIN entry screen with tactile keypad |
| `/dashboard` | `DashboardPage.tsx` | **Yes** | 8-operation ATM menu, quick balances, side-key mapping |
| `/balance` | `BalancePage.tsx` | **Yes** | Ledger balance check, available funds, mini-statement preview |
| `/deposit` | `DepositPage.tsx` | **Yes** | Cash feeder animation, quick presets, deposit review |
| `/withdraw` | `WithdrawPage.tsx` | **Yes** | Cash dispenser, note breakdown preview, confirm modal |
| `/transfer` | `TransferPage.tsx` | **Yes** | Recipient account input, preset amounts, transfer review |
| `/history` | `HistoryPage.tsx` | **Yes** | Filterable audit statement, thermal print trigger |
| `/change-pin` | `ChangePinPage.tsx` | **Yes** | 3-step PIN verification with numerical keypads |
| `/eject` | `EjectPage.tsx` | No | Card retrieval animation, exit message, return countdown |
| `*` | `NotFoundPage.tsx` | No | Terminal fault 404 diagnostic screen with home actions |

---

## 8. Style Guide Delta Analysis: Current Codebase vs. Design Guide

The following gap analysis compares the existing implementation with the attached *APEX Theme and UI Style Guide* (`APEX_Theme_and_UI_Style_Guide.docx`):

| Area | Current Codebase Implementation | APEX Theme & UI Style Guide Requirement | Gap / Action Required |
|---|---|---|---|
| **Light Theme Palette** | Architectural Titanium (`#E2E8F0` canvas, `#FFFFFF` surface) | **Warm Ivory & Champagne**: `#F5F2EB` background, `#FFFEFA` surface, `#EEE9DF` elevated, `#DCD4C7` border, `#253448` navy, `#009F7D` emerald, `#36BCE8` cyan, `#B9945B` champagne | Migrate light tokens to Warm Ivory & Champagne palette |
| **Dark Theme Palette** | Dark Basalt (`#06090E` canvas, `#0F172A` surface) | **Industrial Navy**: `#0B1220` background, `#111C2E` surface, `#18263A` elevated, `#293A50` border, `#F4F7FA` text, `#AAB8C8` muted text | Migrate dark tokens to Industrial Navy palette |
| **Status Colours** | Tailored Tailwind defaults | **Strict Semantic Tokens**: Success `#269B70`, Warning `#D99A28`, Error `#D64545`, Info `#3976B8` | Update semantic status variables |
| **Typography** | `Inter` (sans) and `JetBrains Mono` (mono) | **IBM Plex Sans** (primary UI) and **IBM Plex Mono** (technical/numeric) | Import IBM Plex fonts; update Tailwind font definitions |
| **App Shell & Nav** | ATM Kiosk enclosure with physical bezel buttons (`L1-L4`, `R1-R4`) and basic mobile menu drawer | **Hybrid Shell**: Collapsible glass sidebar on desktop, floating glass bottom nav on mobile, floating glass header with branding & context | Build collapsible sidebar and floating navigation while preserving ATM chassis mode |
| **Dashboard** | 8-operation ATM menu grid | **Rich Banking Dashboard**: Account overview card, prominent ATM launch panel, real balance chart/trend, transaction timeline | Enhance dashboard with account overview cards & ATM launcher while preserving real backend data |
| **Component System**| Ad-hoc components in `components/ui` and `components/atm` | **Centralized Shared Library**: Standardized Button, Input, Card, Dialog, Toast, Tooltip, Progress Ring supporting all 11 lifecycle states | Build formal design system library with complete interactive states |
| **Processing State**| Indeterminate spinner in modal | **Progress Ring with Explicit Stages**: Validating, Processing, Completing (no fake percentages) | Implement circular SVG progress ring component |
| **Hardware Truth** | Direct backend sync | Strict rule: Animations must never imply completion prior to backend response | Maintain strict hardware-backend truth sync |
| **Settings** | Non-existent dedicated screen | Dedicated settings layout (Account, Preferences, Security, Appearance) | Implement settings interface connected to real state |

---

## 9. Baseline Verification & Test Records

The current codebase was verified in Phase 0 without modifying application code:

1. **Java Backend Automated Tests**:
   - Command: `.\mvnw.cmd test`
   - Result: **34 / 34 Tests Passed** (0 failures, 0 errors, 0 skipped, 35.8s).
   - Test classes: `AtmHardwareTest`, `AtmIntegrationTest`, `FullStackAtmFlowTest`, `PinSecurityServiceTest`, `CashDispenserServiceTest`.
2. **Frontend Automated Tests**:
   - Command: `npm.cmd --prefix frontend test -- --run`
   - Result: **7 / 7 Tests Passed** (100% passing, 2.19s).
3. **Frontend Production Build**:
   - Command: `npm.cmd --prefix frontend run build`
   - Result: **Success** in 1.74s (`tsc -b && vite build` clean).
4. **Backend Packaging**:
   - Command: `.\mvnw.cmd package -DskipTests`
   - Result: **Success** (`target/atm-web-application-1.0.0.jar` created).
5. **Live Backend Health Probe**:
   - Endpoint: `http://localhost:8080/api/atm/health`
   - Result: `HTTP 200 OK` (`{"status":"UP","service":"apex-atm-backend","version":"1.0.0"}`).

---

## 10. Audit Sign-Off & Phase 0 Conclusion

The baseline repository is healthy, modular, strictly grounded in real Java OOP logic, and ready for systematic phased implementation of the APEX Theme & UI Style Guide.

