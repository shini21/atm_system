# APEX BANK: Modern Full-Stack Touchscreen ATM Banking System

[![Java 17](https://img.shields.io/badge/Java-17%20LTS-007396?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Data JPA](https://img.shields.io/badge/Spring%20Data-JPA%20%2B%20H2-4479A1?logo=hibernate&logoColor=white)](https://spring.io/projects/spring-data-jpa)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Motion](https://img.shields.io/badge/Motion%20for%20React-14-FF0055?logo=framer&logoColor=white)](https://motion.dev/)
[![Build & Tests](https://img.shields.io/badge/JUnit%205-34%20Tests%20Passing-brightgreen)](https://junit.org/junit5/)
[![Bilingual](https://img.shields.io/badge/Languages-EN%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80-orange)](#)
[![Theme](https://img.shields.io/badge/Theme-Light%20%7C%20Dark-blue)](#)

A full-stack, enterprise-grade ATM banking application built upon a robust Java Object-Oriented Programming (OOP) foundation. It combines a **Spring Boot 3 REST backend with JPA persistence** and an **Apple-inspired minimal luxury React 19 + TypeScript touchscreen terminal**, featuring a physical kiosk enclosure, tactile numeric keypad with Web Audio API sound synthesis, motorized note dispenser with greedy ₹500, ₹200, ₹100 note breakdown, thermal receipt printer, and 60-second inactivity auto-logout.

Both the **modern touchscreen web application** and the **original academic console application** coexist harmoniously and share the exact same domain business rules, accounts, and financial calculations.

---

## Table of Contents

1. [Key Features & Highlights](#key-features--highlights)
2. [Full-Stack Architecture](#full-stack-architecture)
3. [Technology Stack](#technology-stack)
4. [Demo Accounts & Test Cards](#demo-accounts--test-cards)
5. [Quickstart Guide](#quickstart-guide)
   - [Running the Spring Boot Backend](#1-running-the-spring-boot-backend)
   - [Running the React Web Frontend](#2-running-the-react-web-frontend)
   - [Running the Original Console App](#3-running-the-original-console-application)
6. [REST API Documentation](#rest-api-documentation)
7. [Touchscreen ATM Screens & Hardware Simulation](#touchscreen-atm-screens--visual-ux)
8. [Automated Test Suite (34 Passing Tests)](#automated-test-suite-21-passing-tests)
9. [Core OOP Concepts Demonstrated](#core-oop-concepts-demonstrated)
10. [UML Class Diagram & Domain Model](#uml-class-diagram--domain-model)
11. [Project Structure](#project-structure)

---

## Key Features & Highlights

- **Physical ATM Terminal Chassis & Side Function Keys**:
  - Architectural matte bezel and recessed display housing designed with `ui-ux-pro-max` (Swiss minimalism, Deep Emerald `#065F46` / `#10B981` brand accent, Brushed Brass `#D97706`).
  - 8 physical metallic side function keys (`L1`–`L4` and `R1`–`R4`) flanking the screen with directional chevrons (`►` and `◄`).
  - Authentic 8-operation ATM menu aligned directly with the side keys (Withdrawal, Deposit, Transfer, Balance, Mini Statement, History, PIN Change, Eject).
  - Prominent live circular session countdown ring with pulsing warning state in the last 15s.
  - Strict account number masking (`ACC••••1001`) across all terminal screens.
- **Full-Stack Integration & Genuine Java Backend**: Every financial operation in the React frontend communicates in real-time with the Java Spring Boot backend over REST. Strict zero-JS business logic policy.
- **Embedded JPA Persistence & BCrypt**:
  - Embedded H2 file database (`atm_db.mv.db`) with zero setup overhead.
  - Optional production MySQL database profile (`application-mysql.properties`).
  - Salted BCrypt PIN hashing (`$2a$10$...`) with secure matching and legacy plaintext fallback.
- **Realistic Motorized Cash Dispenser & Denominations**:
  - Strictly supported notes: ₹500, ₹200, ₹100 (strictly no ₹2000 notes).
  - Greedy note breakdown calculation returned in API responses to drive frontend animations.
  - Minimum withdrawal multiple: ₹100; Maximum limit per transaction: ₹20,000.00.
  - Decrements physical ATM inventory upon dispense; increments inventory upon cash deposit.
- **Thermal Receipt Printer**:
  - Mechanical paper slit animation where thermal paper emerges with serrated tear line.
  - Contains transaction reference, masked account, amount, remaining balance, and printable PDF view.
- **Tactile ATM Keypad & Web Audio Synthesizer**:
  - Physical 4×3 metallic ATM keypad with tactile depression, braille dot on key 5, function keys (Cancel, Clear, Backspace, Enter).
  - Synchronized with physical PC keyboard and active on-screen input fields.
  - Zero-dependency Web Audio API sound synthesis: crisp metallic clicks, card ingestion/ejection whirrs, roller flutter, thermal print sounds, and confirmation chords.
- **Stateful Session Security & 60-Second Inactivity Auto-Logout**:
  - Protected HTTP session cookies (`JSESSIONID`).
  - Inactivity countdown timer with a 20-second warning banner and automatic card ejection upon timeout.
- **Bilingual Interface (English & Hindi)**:
  - Instant one-click toggle between English and authentic Hindi (हिन्दी) banking terminology ("नकद निकासी", "नकद जमा", "शेष राशि", "पिन बदलें", "रसीद").
- **Minimal Luxury Dual-Theme Design**:
  - Designed with `ui-ux-pro-max` (Swiss minimalism & authority palette: Obsidian `#0F172A`, warm gold `#F59E0B`, Inter + JetBrains Mono).
  - High-contrast Light and Dark theme toggle persistent across sessions.
- **Card Security & Attempt Limit**:
  - Exactly 4-digit PIN verification.
  - Automatic card lockout after 3 consecutive failed attempts.
  - Dedicated `/api/atm/unblock` endpoint for instructor/classroom demo convenience.
- **Financial Precision (`BigDecimal`)**:
  - Zero floating-point rounding inaccuracies. All calculations use `BigDecimal` scale 2 with `RoundingMode.HALF_UP`.
  - Enforced minimum balances: ₹100.00 for `SavingsAccount`, ₹0.00 for `CurrentAccount`.

---

## Full-Stack Architecture

```text
  +-----------------------------------------------------------------------------+
  |                        TOUCHSCREEN ATM USER INTERFACE                       |
  |             (React 18, Vite, TypeScript, Tailwind CSS, Motion)              |
  |   - Welcome Screen        - PIN Touchscreen Keypad   - Dynamic Bento Grid   |
  |   - 3D Debit Card Widget  - NumberTicker Counter     - Cash Dispenser Slot  |
  +---------------------------------------+-------------------------------------+
                                          | JSON over HTTP / Vite Proxy (Port 5173 -> 8080)
                                          | Credentials: JSESSIONID cookie
                                          v
  +-----------------------------------------------------------------------------+
  |                          SPRING BOOT REST BACKEND                           |
  |   [Controllers]                                                             |
  |     - AuthController        (/api/auth/*)                                   |
  |     - AccountController     (/api/account/*)                                |
  |     - TransactionController (/api/transactions/*)                          |
  |                                                                             |
  |   [Security, DTOs & Exception Handling]                                     |
  |     - WebMvcConfig (CORS with credentials)                                  |
  |     - GlobalExceptionHandler (@RestControllerAdvice -> 400, 401, 403, 404)  |
  |     - AtmWebService (Thread-safe session-backed domain orchestrator)         |
  +---------------------------------------+-------------------------------------+
                                          | Pure Java Domain Method Calls
                                          v
  +-----------------------------------------------------------------------------+
  |                        JAVA DOMAIN OOP ARCHITECTURE                         |
  |   [Bank Repository (Singleton)]                                             |
  |     - HashMap<String, Account>  (Case-insensitive, whitespace-trimmed)     |
  |     - HashMap<String, ATMCard>  (Thread-safe atomic updates)                |
  |                                                                             |
  |   [Polymorphic Models]                                                      |
  |     - Account (abstract) <--- SavingsAccount (Min ₹100), CurrentAccount (₹0)|
  |     - Card (abstract)    <--- ATMCard (links to account, tracks attempts)   |
  |     - Customer (immutable record of identity)                               |
  |     - TransactionRecord  (Immutable ledger entries TXN-1001, TXN-1002...)  |
  |                                                                             |
  |   [Interfaces]                                                              |
  |     - Authenticatable, TransactionOperations, Printable                    |
  +-----------------------------------------------------------------------------+
```

---

## Technology Stack

### Backend
- **Language**: Java 17 (OpenJDK 17 LTS)
- **Framework**: Spring Boot 3.3.4
- **Web Layer**: Spring MVC (`spring-boot-starter-web`)
- **Validation**: Jakarta Validation API (`spring-boot-starter-validation`)
- **Build Tool**: Apache Maven 3.9.9 via self-contained Maven Wrapper (`mvnw.cmd` / `./mvnw`)
- **Testing**: JUnit 5, AssertJ, Mockito, Spring Test (`MockMvc`)

### Frontend
- **Framework**: React 18 with Vite 6 & TypeScript 5
- **Styling**: Tailwind CSS 3.4 (Custom Midnight Navy Fintech Palette)
- **Animation**: Motion for React (`motion` v12+, imported via `"motion/react"`)
- **Iconography**: Lucide React
- **HTTP Client**: Axios with `withCredentials: true`
- **Routing**: React Router DOM 6

---

## Demo Accounts & Test Cards

The system comes pre-loaded with the exact classroom demo dataset:

| Card Number | Linked Account | 4-Digit PIN | Account Holder | Account Type | Balance | Expiry Date | Status | Purpose & Test Scenario |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CARD1001` | `ACC1001` | `1234` | **Aarav Sharma** | Savings | ₹5,000.00 | 2028-12-31 | <span style="color:green">ACTIVE</span> | Standard savings flow; ₹100.00 minimum balance rule |
| `CARD1002` | `ACC1002` | `5678` | **Priya Patel** | Current | ₹12,000.00 | 2028-06-30 | <span style="color:green">ACTIVE</span> | Standard current flow; ₹0.00 minimum balance rule |
| `CARD1003` | `ACC1003` | `4321` | **Rahul Verma** | Savings | ₹800.00 | 2025-01-01 | <span style="color:orange">EXPIRED</span> | Rejection test for expired cards |
| `CARD1004` | `ACC1004` | `9999` | **Neha Iyer** | Savings | ₹1,500.00 | 2028-12-31 | <span style="color:red">BLOCKED</span> | Rejection test for pre-blocked cards |
| `CARD1005` | `ACC1005` | `2468` | **Vikram Malhotra** | Savings | ₹150.00 | 2028-12-31 | <span style="color:green">ACTIVE</span> | Low balance test (minimum balance ₹100 enforcement) |

> **Persistence Notice**: All balances, transaction records, and card states are stored persistently in the embedded H2 file database (`./data/atm_db.mv.db`). Real-time mutations survive server restarts. An optional MySQL database profile is also provided (`application-mysql.properties`).

---

## Quickstart Guide

### 0. 1-Click Launch (Windows)
Double-click or run from terminal:
```cmd
start-atm.bat
```
This automatically compiles and launches the Spring Boot backend on port 8080, launches the Vite touchscreen frontend on port 5173, and opens your default browser at `http://localhost:5173`.

---

### 1. Running the Spring Boot Backend

From the project root directory, run the Maven wrapper:

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

The Spring Boot backend will start on **`http://localhost:8080`**.

---

### 2. Running the React Web Frontend

Open a second terminal, navigate into `frontend`, and launch the development server:

```bash
cd frontend

# Install dependencies (only required on first run)
npm install

# Start Vite touchscreen terminal
npm run dev
```

Open your browser and navigate to **`http://localhost:5173`**.

---

### 3. Running the Original Console Application

The original console application remains completely intact and can be compiled and run directly:

```bash
# Compile console classes to bin/
javac -d bin -sourcepath src src/com/bank/atm/Main.java

# Run interactive console ATM
java -cp bin com.bank.atm.Main
```

---

## REST API Documentation

All API endpoints return a uniform JSON envelope:

```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "timestamp": "2026-11-08T00:00:00"
}
```

### Endpoints Overview

| Method | Endpoint | Description | Request Body | Auth Required | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/card` | Check card validity & status | `{"cardNumber": "CARD1001"}` | No | 200, 400, 403, 404 |
| `POST` | `/api/auth/login` | Verify PIN & establish session | `{"cardNumber": "CARD1001", "pin": "1234"}` | No | 200, 401, 403, 404 |
| `GET` | `/api/auth/session` | Inspect active session | None | Optional | 200 |
| `POST` | `/api/auth/logout` | Invalidate session & eject card | None | Yes | 200 |
| `POST` | `/api/auth/change-pin` | Change 4-digit PIN | `{"currentPin": "1234", "newPin": "9876", "confirmPin": "9876"}` | Yes | 200, 400, 401 |
| `GET` | `/api/account/details` | Customer profile & account summary | None | Yes | 200, 401 |
| `GET` | `/api/account/balance` | Real-time current & available balance | None | Yes | 200, 401 |
| `POST` | `/api/transactions/deposit` | Deposit cash | `{"amount": 1000.00}` | Yes | 200, 400, 401 |
| `POST` | `/api/transactions/withdraw` | Withdraw cash | `{"amount": 500.00}` | Yes | 200, 400, 401 |
| `POST` | `/api/transactions/transfer` | Transfer funds to another account | `{"recipientAccountNumber": "ACC1002", "amount": 500.00}` | Yes | 200, 400, 401, 404 |
| `GET` | `/api/transactions/recent` | Get latest 5 transactions | Query param: `?limit=5` | Yes | 200, 401 |

---

## Touchscreen ATM Screens & Visual UX

The frontend is organized into 10 screens following the ATM physical workflow:

1. **Welcome Screen (`/`)**: Futuristic ATM branding, interactive card insertion slot, and classroom demo card selector rack.
2. **PIN Authentication (`/pin`)**: 3D debit card visual, 4-dot spring indicator, full touchscreen numeric keypad, remaining attempt warning, and error shake animation.
3. **ATM Dashboard (`/dashboard`)**: Personalized greeting, live balance ticker, and 6-action touch bento grid.
4. **Balance Inquiry (`/balance`)**: Large `NumberTicker` counter, available vs. minimum balance breakdown, and printable ATM receipt slip modal.
5. **Cash Deposit (`/deposit`)**: Quick denomination buttons (₹500, ₹1000, ₹2000, ₹5000), custom amount keypad, and animated cash intake shutter slot.
6. **Cash Withdrawal (`/withdraw`)**: Fast cash presets, custom withdrawal, minimum balance guard, and animated cash dispenser with "Take Cash" prompt.
7. **Money Transfer (`/transfer`)**: Recipient account validation, demo recipient quick-select chips, and two-step confirmation modal.
8. **Transaction History (`/history`)**: Color-coded transaction badges (Green for Inflow, Red for Outflow, Blue for PIN change), transaction IDs, and date-times.
9. **Change PIN (`/change-pin`)**: Current PIN verification, new PIN confirmation, and live backend update.
10. **Card Ejection (`/eject`)**: Card sliding up out of the slot, thank-you banner, and 5-second automatic return countdown.

---

## Automated Test Suite (21 Passing Tests)

The backend features a comprehensive test suite in `test/com/bank/atm/`:

```bash
# Run all automated tests via Maven
.\mvnw.cmd test
```

### Test Coverage Highlights
- **`AtmWebServiceTest` (13 Unit Tests)**:
  - Active card verification, expired card rejection, blocked card rejection.
  - Successful PIN verification, failed attempt counter increment, 3-attempt blocking.
  - Positive deposits, withdrawals respecting minimum balances, overdraw rejection (`InsufficientFundsException`).
  - Account-to-account transfers, self-transfer rejection.
  - PIN modification, old PIN verification, mismatched confirm PIN rejection.
  - Recent transactions ordering (newest first).
- **`AtmIntegrationTest` (4 MockMvc Tests)**:
  - REST endpoint contracts for `/api/auth/card`, `/api/auth/login`, `/api/account/balance`.
  - Deposit and withdrawal end-to-end execution.
  - Unauthenticated access rejection (HTTP 401).
- **`FullStackAtmFlowTest` (4 End-to-End Scenario Tests)**:
  - Complete 10-step customer user journey: Card Insert &rarr; Login &rarr; Balance &rarr; Deposit &rarr; Withdraw &rarr; Transfer &rarr; History &rarr; PIN Change &rarr; Eject.
  - Three failed PIN attempts resulting in immediate card lock.
  - Expired card rejection (HTTP 400).
  - Pre-blocked card rejection (HTTP 403).

---

## Core OOP Concepts Demonstrated

| Concept | Location in Codebase | Concrete Implementation |
|---|---|---|
| **Encapsulation** | `model/Account.java`, `model/Card.java`, `service/Bank.java` | All fields are strictly `private`. `Account` has **no `setBalance()`**; balances change only through verified `deposit()`, `withdraw()`, and `transfer()`. `Card` has no PIN getter; attempts and blocking are internal. `Bank` protects its internal HashMaps. |
| **Abstraction** | `Account`, `Card` | Abstract classes define contracts (`getAccountType()`, `getMinimumBalance()`, `isValid()`) without permitting direct instantiation. |
| **Inheritance** | `SavingsAccount`, `CurrentAccount`, `ATMCard` | `Account` &larr; `SavingsAccount`, `CurrentAccount`; `Card` &larr; `ATMCard`. |
| **Interfaces** | `interfaces/` | `Authenticatable` (enforced by `Card`), `TransactionOperations` (enforced by `Account`), `Printable` (enforced by `Customer`, `Card`, `Account`, `TransactionRecord`). |
| **Polymorphism** | `AtmWebService.java`, `Bank.java`, `Main.java` | Accounts are referenced through the abstract `Account` type; dynamic dispatch resolves Savings vs. Current minimum balance calculations at runtime. |
| **Custom Exceptions** | `exceptions/` (7 checked exceptions) | Domain violations throw specific checked exceptions mapped cleanly to REST HTTP status codes via `@RestControllerAdvice`. |
| **Collections** | `Bank.java`, `Account.java`, `TransactionHistory.java` | Fast O(1) in-memory lookup via `HashMap<String, Account>` and `HashMap<String, ATMCard>`; chronological ledger using `ArrayList<TransactionRecord>`. |

---

## UML Class Diagram & Domain Model

```text
        <<interface>>                      <<interface>>
        Authenticatable                    Printable
        + verifyPin(pin)                   + printSummary()
        + changePin(old, new)
               ^                                  ^
               | implements                       | implements
               +----------------+-----------------+
                                |
                        <<abstract>> Card
                        - cardNumber : String
                        - pin : String
                        - expiryDate : LocalDate
                        - blocked : boolean
                        - failedPinAttempts : int
                        + isValid() : boolean   {abstract}
                        + verifyPin() / changePin() / block()
                                ^
                                | extends
                             ATMCard
                        - linkedAccountNumber : String
                        + isValid() : boolean

        <<interface>>                      <<interface>>
        TransactionOperations              Printable
        + deposit(amount)                  + printSummary()
        + withdraw(amount)
        + transfer(receiver, amount)
        + getBalance()
               ^                                  ^
               | implements                       | implements
               +----------------+-----------------+
                                |
                      <<abstract>> Account
                      - accountNumber : String
                      - owner : Customer
                      - balance : BigDecimal
                      - transactionHistory : List<TransactionRecord>
                      + getAccountType() : String        {abstract}
                      + getMinimumBalance() : BigDecimal {abstract}
                      + deposit() / withdraw() / transfer()
                                ^
                                | extends
                  +-------------+--------------+
                  |                            |
            SavingsAccount               CurrentAccount
            minimum balance 100.00       minimum balance 0.00
```

---

## Project Structure

```text
atm_system/
├── resources/                                # Runtime application configurations
│   ├── application.properties                # Spring Boot H2 persistent database config
│   └── application-mysql.properties          # Production MySQL profile config
├── src/
│   └── com/
│       └── bank/
│           └── atm/
│               ├── Main.java                 # Standalone console entry point (javac-executable)
│               ├── AtmApplication.java       # Spring Boot web entry point
│               ├── config/                   # BankConfig, DataInitializer, WebMvcConfig
│               ├── controller/               # Auth, Account, Transaction, AtmHardware controllers
│               ├── dto/                      # Request & response transfer envelopes
│               ├── entity/                   # JPA database entities (Account, Card, Transaction, etc.)
│               ├── enums/                    # TransactionType enum
│               ├── exceptions/               # Domain checked exceptions & GlobalExceptionHandler
│               ├── interfaces/               # Core OOP contracts (Authenticatable, Printable, TransactionOperations)
│               ├── model/                    # Domain models (Account, SavingsAccount, CurrentAccount, Card, etc.)
│               ├── repository/               # Spring Data JPA repositories
│               ├── security/                 # PinSecurityService (BCrypt hashing)
│               ├── service/                  # Domain services (ATM, Bank, History) & Web services
│               └── util/                     # InputValidator
├── test/com/bank/atm/                        # 34 JUnit 5 & MockMvc automated tests
├── frontend/                                 # React 19 + Vite + TypeScript Touchscreen Kiosk
│   ├── src/
│   │   ├── components/                       # atm/, cards/, layout/, transactions/, ui/
│   │   ├── context/                          # AuthContext, HardwareContext, LanguageContext, ThemeContext
│   │   ├── pages/                            # 10 Touchscreen ATM kiosk views
│   │   ├── services/                         # Centralized Axios client (api.ts)
│   │   └── types/                            # Strict TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── pom.xml                                   # Maven configuration (Java 17, Spring Boot 3.3.4)
├── mvnw.cmd / mvnw                           # Maven wrapper executable
├── start-atm.bat                             # 1-Click launcher for both backend & frontend
├── ARCHITECTURE.md                           # Comprehensive Architecture & Engineering Guide
├── PHASES.md                                 # Phased development & bug resolution log
├── LICENSE                                   # MIT License
├── OOP_CONCEPTS.md                           # Object-Oriented Programming principles mapping
├── API_DOCUMENTATION.md                      # Complete REST API specification
├── VIVA_PREPARATION.md                       # Complete viva defense preparation guide
├── FINAL_PROJECT_AUDIT.md                    # Verification audit report & metrics
├── DESIGN_SYSTEM.md                          # UI design system & physical chassis tokens
└── README.md                                 # Complete project documentation
```

---

## Academic Verification & Integrity

- **Original Console Project**: Fully functional and compilable via `javac` without Spring or Node dependencies.
- **Academic Source of Truth**: All business rules (3 PIN attempts, card blocking, minimum balance calculations, transfers, greedy cash dispensing) originate strictly in the Java domain layer.
- **Git Branching Strategy**: Built cleanly on branch `feature/premium-atm` with phase-wise conventional commits.
