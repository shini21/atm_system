# APEX Touch Banking — Backend Architecture & Technical Specification

> **Enterprise Banking Engine, Hardware Controller & Java OOP Core**  
> **Tech Stack**: Java 17/21, Spring Boot 3.3.4, Spring Data JPA, Hibernate ORM, H2 Embedded Database, BCrypt Cryptography, JUnit 5  
> **Live Production URL**: `https://atm-system-dz11.onrender.com/`  
> **Health Check**: `https://atm-system-dz11.onrender.com/api/atm/health`

---

## 1. System Overview

The backend is an enterprise-grade Java OOP banking server acting as the **single authoritative source of truth** for all ATM hardware events, financial ledger updates, customer balances, card validation, and security auditing.

Zero transactions, balances, or note allocations are fabricated or calculated client-side. Every operation strictly executes within transactional boundaries with ACID compliance on the embedded H2 database engine.

---

## 2. Directory Structure & Package Hierarchy

```
src/com/bank/atm/
├── AtmApplication.java          # Spring Boot main entrypoint
├── config/                      # Infrastructure & Spring configurations
│   ├── BankConfig.java          # Singleton in-memory Bank and TransactionHistory beans
│   ├── DataInitializer.java     # CommandLineRunner seeding initial demo data
│   └── WebMvcConfig.java        # Cross-Origin Resource Sharing (CORS) configuration
├── controller/                  # RESTful API Presentation Layer
│   ├── AccountController.java   # /api/account (Details, balance inquiry)
│   ├── AtmHardwareController.java # /api/atm (Status, health, cash inventory, card unblock)
│   ├── AuthController.java      # /api/auth (Card check, login, session, PIN change)
│   └── TransactionController.java # /api/transactions (Deposit, withdraw, transfer, recent)
├── dto/                         # Data Transfer Objects & JSON Schemas
│   ├── request/                 # CardCheckRequest, LoginRequest, DepositRequest, etc.
│   └── response/                # ApiResponse<T>, BalanceResponse, TransactionItemResponse, etc.
├── entity/                      # JPA Persistence Entities (Hibernate Relational Mapping)
│   ├── AccountEntity.java       # ACCOUNTS table (mapped to CustomerEntity)
│   ├── AtmInventoryEntity.java  # ATM_INVENTORY table (note counts per denomination)
│   ├── CardEntity.java          # CARDS table (stores BCrypt PIN hash and failed attempts)
│   ├── CustomerEntity.java      # CUSTOMERS table
│   └── TransactionEntity.java   # TRANSACTIONS table (immutable audit ledger)
├── enums/                       # Strongly typed domain constants
│   ├── AccountType.java         # SAVINGS, CURRENT
│   ├── CardStatus.java          # ACTIVE, BLOCKED, EXPIRED
│   └── TransactionType.java     # DEPOSIT, WITHDRAWAL, TRANSFER_IN, TRANSFER_OUT, PIN_CHANGE
├── exceptions/                  # Domain Exception Hierarchy
│   ├── AccountNotFoundException.java
│   ├── AtmException.java        # Checked base domain exception
│   ├── CardBlockedException.java
│   ├── CardExpiredException.java
│   ├── InsufficientFundsException.java
│   ├── InvalidAmountException.java
│   └── InvalidPinException.java
├── interfaces/                  # Abstract Behavioural Contracts (OOP Abstraction)
│   ├── AccountOperations.java   # deposit(), withdraw(), getBalance()
│   ├── AtmOperations.java       # checkCard(), login(), logout(), getRecentTransactions()
│   └── CardOperations.java      # verifyPin(), changePin(), block(), isBlocked()
├── model/                       # Pure Java OOP Domain Models (Business Logic)
│   ├── ATMCard.java             # Card model implementing CardOperations
│   ├── Account.java             # Abstract base class implementing AccountOperations
│   ├── CurrentAccount.java      # Subclass: zero minimum balance, overdraft support
│   ├── Customer.java            # Customer profile POJO
│   ├── SavingsAccount.java      # Subclass: enforces ₹100 minimum balance rule
│   └── TransactionRecord.java   # Value object representing completed financial operations
├── repository/                  # Spring Data JPA Repositories
│   ├── AccountRepository.java
│   ├── AtmInventoryRepository.java
│   ├── CardRepository.java
│   ├── CustomerRepository.java
│   └── TransactionRepository.java
├── security/                    # Cryptography & Vault Services
│   └── PinSecurityService.java  # BCryptPasswordEncoder hashing and salted verification
└── service/                     # Application Business Logic Layer
    ├── AtmPersistenceService.java # JPA transactional database synchronization
    ├── AtmWebService.java         # Primary orchestrator coordinating Bank and Database
    ├── Bank.java                  # Domain aggregate managing memory registry
    ├── CashDispenserService.java  # Greedy note allocation algorithm (₹500, ₹200, ₹100)
    └── TransactionHistory.java    # Audit trail accumulator
```

---

## 3. Object-Oriented Programming (OOP) Architecture

The backend strictly demonstrates the four foundational OOP pillars:

### 1. Encapsulation
- Account balances (`BigDecimal balance`) are strictly `private` and protected against direct mutation.
- Balances can only be adjusted through validated domain methods (`deposit()`, `withdraw()`) that check constraints, limits, and positive amounts.

### 2. Inheritance & Polymorphism
- `Account.java` is an `abstract` base class containing shared banking logic (account number, owner, timestamps).
- `SavingsAccount` and `CurrentAccount` inherit from `Account` and provide polymorphic behavior:
  ```java
  // Polymorphic dispatch:
  Account acc1 = new SavingsAccount("ACC1001", customer, new BigDecimal("5000.00"));
  Account acc2 = new CurrentAccount("ACC1002", customer, new BigDecimal("12000.00"));

  acc1.withdraw(new BigDecimal("4950.00")); // Throws InsufficientFundsException (Min balance ₹100)
  acc2.withdraw(new BigDecimal("12000.00")); // Succeeds (Min balance ₹0)
  ```

### 3. Abstraction
- Defined by clean, decoupled interfaces (`AccountOperations`, `CardOperations`, `AtmOperations`).
- Web controllers interact solely with interfaces, hiding internal persistence, hashing, and database queries.

### 4. Custom Exception Hierarchy
- All business violations produce typed domain exceptions extending `AtmException`. A global exception handler maps these to standard HTTP status codes (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`).

---

## 4. Hardware Cash Allocation Algorithm

The `CashDispenserService` simulates the physical ATM currency cassette using a **Greedy Denomination Allocation Algorithm**:

- **Supported Banknotes**: ₹500, ₹200, ₹100
- **Allocation Logic**:
  1. Validates that requested amount is positive, does not exceed ₹20,000, and is a multiple of ₹100.
  2. Iterates descending denominations (₹500 first, then ₹200, then ₹100).
  3. Checks physical cassette inventory (`AtmInventoryEntity`) to ensure notes are physically present.
  4. Returns a breakdown map (`{"500": 3, "200": 2, "100": 1}`) and atomically deducts inventory from the database upon successful dispatch.

---

## 5. Security & Cryptographic Vault

- **BCrypt Password Hashing**: PIN numbers are never stored in plain text. `PinSecurityService` uses `BCryptPasswordEncoder` with 10 salt rounds.
- **Brute Force Lockout Machine**:
  - The system tracks `failedAttempts` on each card entity.
  - If a user enters an incorrect PIN 3 consecutive times, `card.setBlocked(true)` is committed immediately to the database.
  - Any subsequent authentication attempt returns `403 Forbidden` ("Card is blocked. Please contact your bank.").
  - An administrative unblock endpoint (`POST /api/atm/unblock?cardNumber=...`) allows simulated recovery for demo testing.

---

## 6. REST API Endpoints

| Category | Method | Path | Description | Status Codes |
| :--- | :---: | :--- | :--- | :---: |
| **Hardware** | `GET` | `/api/atm/health` | Service uptime and zero-dependency ping | `200` |
| **Hardware** | `GET` | `/api/atm/status` | Terminal online status & available cash | `200` |
| **Hardware** | `POST` | `/api/atm/unblock` | Unblock a card and reset failed attempts | `200, 404` |
| **Auth** | `POST` | `/api/auth/card` | Verify card existence, expiry, and block state | `200, 400, 403, 404` |
| **Auth** | `POST` | `/api/auth/login` | Verify PIN, issue `JSESSIONID` cookie | `200, 401, 403` |
| **Auth** | `GET` | `/api/auth/session` | Validate current authenticated session | `200, 401` |
| **Auth** | `POST` | `/api/auth/logout` | Terminate session and invalidate cookie | `200` |
| **Auth** | `POST` | `/api/auth/change-pin`| Change card PIN with old PIN validation | `200, 400, 401` |
| **Account** | `GET` | `/api/account/details` | Retrieve customer profile and masked card | `200, 401` |
| **Account** | `GET` | `/api/account/balance` | Ledger and available balance inquiry | `200, 401` |
| **Transactions**| `POST` | `/api/transactions/deposit` | Deposit cash into authenticated account | `200, 400, 401` |
| **Transactions**| `POST` | `/api/transactions/withdraw` | Withdraw cash with banknote breakdown | `200, 400, 401` |
| **Transactions**| `POST` | `/api/transactions/transfer` | Intra-bank transfer to another account ID | `200, 400, 401` |
| **Transactions**| `GET` | `/api/transactions/recent` | Chronological audit trail (limit query) | `200, 401` |

---

## 7. Cloud Deployment & Containerization

- **Container Runtime**: Multi-stage `Dockerfile` (Maven 3.9 build stage → Alpine Temurin 17 JRE runner).
- **Free-Tier Optimizations**:
  - `-XX:+TieredCompilation -XX:TieredStopAtLevel=1`: Accelerates Spring Boot cold starts on micro-CPU containers from 92s to ~15s.
  - Dynamic port binding: `-Dserver.port=${PORT:-10000} -Dserver.address=0.0.0.0`.
- **CORS Configuration**: Supports cross-origin requests from Vercel (`https://*.vercel.app`) with `allowCredentials(true)`.

---

## 8. Automated Test Suite

- **JUnit 5 & MockMvc**: 34 automated unit and integration tests:
  - `AtmHardwareTest`: Hardware status and health endpoints.
  - `FullStackAtmFlowTest`: Multi-step end-to-end user transactions (card check → login → deposit → withdraw → transfer → history → logout).
  - `PinSecurityServiceTest`: BCrypt hashing and verification checks.
  - `CashDispenserServiceTest`: Banknote allocation math, boundary conditions, and inventory exhaustion.
- **Execution Command**:
  ```bash
  .\mvnw.cmd test    # Run all 34 JUnit tests
  ```
