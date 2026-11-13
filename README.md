# APEX BANK: Modern Full-Stack Touchscreen ATM Banking System

[![Java 17](https://img.shields.io/badge/Java-17%20LTS-007396?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Motion](https://img.shields.io/badge/Motion%20for%20React-12-FF0055?logo=framer&logoColor=white)](https://motion.dev/)
[![Build & Tests](https://img.shields.io/badge/JUnit%205-21%20Tests%20Passing-brightgreen)](https://junit.org/junit5/)

A full-stack, enterprise-grade ATM banking application built upon a robust Java Object-Oriented Programming (OOP) foundation. It combines a **Spring Boot 3 REST backend** with a **modern React 18 + TypeScript touchscreen terminal**, featuring realistic animations powered by Motion for React, Aceternity UI, Magic UI, and React Bits design patterns.

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
7. [Touchscreen ATM Screens & Visual UX](#touchscreen-atm-screens--visual-ux)
8. [Automated Test Suite (21 Passing Tests)](#automated-test-suite-21-passing-tests)
9. [Core OOP Concepts Demonstrated](#core-oop-concepts-demonstrated)
10. [UML Class Diagram & Domain Model](#uml-class-diagram--domain-model)
11. [Project Structure](#project-structure)

---

## Key Features & Highlights

- **Full-Stack Integration**: Every financial operation in the React frontend communicates in real-time with the Java Spring Boot backend. No mock frontend databases.
- **Stateful Session Authentication**: Uses secure HTTP session cookies (`JSESSIONID`) with server-side validation.
- **Card Security & PIN Enforcement**:
  - Exactly 4-digit PIN verification.
  - Maximum 3 failed attempts before automatic card blocking.
  - Expired and blocked card rejection with user-friendly errors.
- **Financial Precision (`BigDecimal`)**:
  - Zero loss of floating-point precision. All currency uses scale 2 with `RoundingMode.HALF_UP`.
  - Enforced minimum balances: ₹100.00 for `SavingsAccount`, ₹0.00 for `CurrentAccount`.
- **Complete Suite of ATM Operations**:
  - **Balance Inquiry**: Live dynamic counting counter (`NumberTicker`), ledger balance vs. available-to-withdraw.
  - **Cash Deposit**: Quick presets (₹500, ₹1000, ₹2000, ₹5000), custom amount keypad, cash intake feeder animation.
  - **Cash Withdrawal**: Fast cash options, custom withdrawal, animated cash dispenser slot with collection action.
  - **Electronic Funds Transfer**: Account-to-account transfer with recipient lookup, same-account transfer guard, two-step confirmation modal.
  - **Transaction History**: Displays the last 5 transactions in reverse chronological order (newest first) with colored badges.
  - **PIN Change**: Verifies old PIN first, enforces 4-digit format, records `PIN_CHANGE` transaction.
  - **Card Ejection**: Animated slide-up card ejection and session teardown.
- **Tactile Touchscreen Kiosk UX**:
  - Authentic ATM numeric keypad (0–9, Clear, Backspace, Confirm).
  - Horizontal shake animation on invalid PIN or rejected transaction.
  - Printable ATM slip modal for statement generation.

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

> **Classroom Notice**: All data resides in-memory in the `Bank` singleton. Restarting the backend resets all balances, transactions, and blocked cards to these initial states.

---

## Quickstart Guide

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
javac -d bin src/app/*.java src/exceptions/*.java src/interfaces/*.java src/model/*.java src/service/*.java src/util/*.java

# Run interactive console ATM
java -cp bin app.Main
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
OOP-CP/
├── src/
│   ├── app/
│   │   └── Main.java                          # Original console application entry point
│   ├── com/bank/atm/                          # Spring Boot Web Application
│   │   ├── AtmApplication.java                # Spring Boot main class
│   │   ├── config/
│   │   │   ├── BankConfig.java                # Singleton Bank bean with demo data seed
│   │   │   └── WebMvcConfig.java              # CORS configuration for Vite frontend
│   │   ├── controller/
│   │   │   ├── AuthController.java            # /api/auth/* endpoints
│   │   │   ├── AccountController.java         # /api/account/* endpoints
│   │   │   └── TransactionController.java     # /api/transactions/* endpoints
│   │   ├── dto/                               # Request and Response transfer objects
│   │   ├── exception/
│   │   │   └── GlobalExceptionHandler.java    # Centralized REST error handling
│   │   └── service/
│   │       └── AtmWebService.java             # Thread-safe session & business bridge
│   ├── exceptions/                            # 7 Domain checked exceptions
│   ├── interfaces/                            # Core OOP contracts
│   ├── model/                                 # Account, Card, Customer, Transaction domain models
│   ├── service/                               # In-memory Bank and TransactionHistory
│   └── util/                                  # InputValidator
├── test/com/bank/atm/
│   ├── AtmWebServiceTest.java                 # 13 Domain unit tests
│   ├── AtmIntegrationTest.java                # 4 Spring MVC integration tests
│   └── FullStackAtmFlowTest.java              # 4 End-to-end full user journey tests
├── frontend/                                  # React 18 + Vite + TypeScript Touchscreen SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── atm/                           # CardGraphic, CashDispenser
│   │   │   ├── layout/                        # AtmKiosk, AnimatedBackground
│   │   │   └── ui/                            # Button, Keypad, NumberTicker, Modal
│   │   ├── context/
│   │   │   └── AuthContext.tsx                # Global session state provider
│   │   ├── pages/                             # 10 Touchscreen ATM pages
│   │   ├── services/
│   │   │   └── api.ts                         # Centralized Axios client with credentials
│   │   └── types/                             # Strict TypeScript DTO models
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── pom.xml                                    # Maven configuration (Java 17, Spring Boot 3.3.4)
├── mvnw.cmd / mvnw                            # Maven wrapper executable
├── FRONTEND_RESOURCES.md                      # UI and animation component attribution
├── PROJECT_STATUS.md                          # Phase tracking and Git commit registry
└── README.md                                  # Complete project documentation
```

---

## Academic Verification & Integrity

- **Original Console Project**: Fully functional and compilable via `javac` without Spring or Node dependencies.
- **Academic Source of Truth**: All business rules (3 PIN attempts, card blocking, minimum balance calculations, transfers) originate strictly in the Java domain layer.
- **Git Branching Strategy**: Built entirely on branch `feature/atm-web-application` with phase-wise commits following standard conventional commits format.
