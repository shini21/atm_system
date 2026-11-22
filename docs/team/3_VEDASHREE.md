# Team Member 3: Vedashree — Hardware Controller, Cash Dispenser & Persistence Layer

> **Name**: Vedashree  
> **Role Title**: Hardware Logic Engine, Currency Dispenser & Database Persistence Specialist  
> **Core Focus**: Cash Dispenser Algorithm, Cassette Inventory Control, JPA Relational Persistence & Automated Backend Testing  
> **Key Code Locations**: `src/com/bank/atm/service/CashDispenserService.java`, `src/com/bank/atm/service/AtmPersistenceService.java`, `src/com/bank/atm/entity/`, `src/com/bank/atm/repository/`, `src/com/bank/atm/controller/AtmHardwareController.java`, `src/com/bank/atm/controller/TransactionController.java`

---

## 1. Executive Summary & Contributions

Vedashree engineered the physical ATM hardware logic that governs banknote dispensing, currency cassette inventory, relational database persistence with Spring Data JPA/Hibernate, and comprehensive automated test coverage.

### Core Areas of Ownership:
1. **Cash Dispenser Greed Engine**: Implemented the physical currency dispatch algorithm calculating optimal denomination breakdowns for ₹500, ₹200, and ₹100 banknotes.
2. **ATM Hardware Controller**: Created the hardware status and health probe endpoints (`/api/atm/status`, `/api/atm/health`).
3. **Database Relational Mapping (JPA)**: Architected the embedded H2 relational schema, mapping entities (`AccountEntity`, `CardEntity`, `AtmInventoryEntity`, etc.) with transactional atomicity.
4. **Backend JUnit Testing Suite**: Authored and maintained 34 automated unit and integration tests covering hardware, cash allocation, and transaction workflows.

---

## 2. Detailed Technical Modules

### A. Cash Dispenser Greedy Algorithm (`CashDispenserService.java`)
- **Cassette Denominations**: ₹500, ₹200, ₹100 notes.
- **Constraints Enforced**:
  - Amount must be strictly positive.
  - Amount must be a valid multiple of the minimum denomination (₹100).
  - Amount must not exceed the maximum single transaction limit of ₹20,000.00.
- **Greedy Allocation with Backtracking Fallback**:
  ```java
  public synchronized Map<Integer, Integer> dispenseCash(BigDecimal amount) 
          throws InvalidAmountException, InsufficientFundsException {
      // 1. Verify total cash availability in ATM cassette
      if (amount.compareTo(totalCashAvailable) > 0) {
          throw new InsufficientFundsException("ATM has insufficient physical cash to fulfill request.");
      }
      
      // 2. Greedy allocation: maximize highest denomination first
      Map<Integer, Integer> breakdown = new LinkedHashMap<>();
      int remaining = amount.intValueExact();
      
      for (int denom : SUPPORTED_DENOMINATIONS) { // 500, 200, 100
          int countNeeded = remaining / denom;
          int countAvailable = inventory.getOrDefault(denom, 0);
          int countToDispense = Math.min(countNeeded, countAvailable);
          
          if (countToDispense > 0) {
              breakdown.put(denom, countToDispense);
              remaining -= countToDispense * denom;
          }
      }
      
      if (remaining > 0) {
          throw new InsufficientFundsException("Cannot dispense exact requested amount with current note inventory.");
      }
      return breakdown;
  }
  ```
- **Atomicity**: When banknotes are dispensed, cassette inventory counts are decremented in the database in the exact same `@Transactional` boundary as the customer's balance deduction.

### B. Spring Data JPA & Persistence Schema (`src/com/bank/atm/entity/`)
- Architected 5 relational entities in Hibernate:
  - `CustomerEntity`: Mapped to `ACCOUNTS` via `@OneToMany`.
  - `AccountEntity`: Primary financial balance records with versioning.
  - `CardEntity`: Links card numbers, hashed PINs, expiry dates, and failed attempt counters to `AccountEntity`.
  - `AtmInventoryEntity`: Tracks real-time physical banknote counts per denomination (`denomination`, `note_count`).
  - `TransactionEntity`: Immutable audit ledger storing timestamps, types (`DEPOSIT`, `WITHDRAWAL`, `TRANSFER`), amounts, and post-transaction balances.

### C. Financial Operations & Transaction Controller (`TransactionController.java`)
- `/api/transactions/deposit`: Processes cash envelope intake and balance credit.
- `/api/transactions/withdraw`: Coordinates `CashDispenserService` and balance deduction, returning both transaction receipt metadata and the physical note breakdown.
- `/api/transactions/transfer`: Atomic intra-bank transfer moving funds between accounts with sender/recipient audit trail entries.
- `/api/transactions/recent`: Chronologically sorted audit trail with limit pagination.

### D. Automated JUnit 5 Test Suite (34 Tests Passing)
- `AtmHardwareTest`: Verifies hardware health, model identifiers, and online status.
- `CashDispenserServiceTest`: Validates denomination math, edge conditions, inventory exhaustion, and boundary limits.
- `FullStackAtmFlowTest`: Executes full end-to-end user journeys (card validation → login → deposit → withdraw with breakdown → transfer → recent history → logout).

---

## 3. Code Files Owned

- `src/com/bank/atm/service/CashDispenserService.java`
- `src/com/bank/atm/service/AtmPersistenceService.java`
- `src/com/bank/atm/controller/AtmHardwareController.java`
- `src/com/bank/atm/controller/TransactionController.java`
- `src/com/bank/atm/entity/*` (all 5 JPA entities)
- `src/com/bank/atm/repository/*` (all 5 Spring Data repositories)
- `src/com/bank/atm/config/DataInitializer.java`
- `src/test/com/bank/atm/*` (JUnit test suite)
- `API_DOCUMENTATION.md`

---

## 4. Viva & Presentation Talking Points

1. **How does the greedy cash dispensing algorithm handle inventory depletion?**  
   *Answer*: The algorithm iterates through descending denominations (`[500, 200, 100]`). If the ATM has exhausted ₹500 notes, `countAvailable` is 0, so it automatically falls back to allocating ₹200 and ₹100 notes. If the exact amount cannot be satisfied with available notes, it aborts without altering balances.
2. **How do you ensure transaction atomicity between balance deduction and physical cash inventory decrement?**  
   *Answer*: In `AtmPersistenceService`, both operations are annotated with `@Transactional`. If either the customer balance deduction or the cassette inventory update fails, the entire transaction rolls back, preventing cash from being dispensed without debiting or vice-versa.
3. **What is the purpose of `/api/atm/health`?**  
   *Answer*: It is an unauthenticated, zero-dependency endpoint that returns `{"status":"UP"}`. Cloud orchestrators (like Render or Docker health checks) ping this endpoint to determine whether the container is healthy and ready to receive traffic.
