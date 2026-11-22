# Team Member 2: Vedika — Core Banking Domain Model & OOP Architecture

> **Name**: Vedika  
> **Role Title**: Banking Domain Modeler, OOP Inheritance & Polymorphism Specialist  
> **Core Focus**: Pure Java OOP Design, Polymorphic Accounts, Domain Exception Hierarchy & Business Invariants  
> **Key Code Locations**: `src/com/bank/atm/model/`, `src/com/bank/atm/interfaces/`, `src/com/bank/atm/exceptions/`, `src/com/bank/atm/controller/AccountController.java`

---

## 1. Executive Summary & Contributions

Vedika engineered the core Object-Oriented Banking Domain model that forms the heart of the application. Her design strictly implements the four fundamental pillars of OOP (**Encapsulation**, **Inheritance**, **Polymorphism**, and **Abstraction**) without relying on frameworks for core domain business rules.

### Core Areas of Ownership:
1. **Polymorphic Account Subsystem**: Designed the abstract `Account` base class and specialized concrete classes (`SavingsAccount` vs. `CurrentAccount`) with runtime dynamic method dispatch.
2. **Interface Abstraction**: Architected decoupled behavioral contracts (`AccountOperations`, `CardOperations`) to enforce clean architectural boundaries.
3. **Domain Exception Architecture**: Built a centralized, strongly typed exception hierarchy rooted at `AtmException`.
4. **Account Information Presentation**: Developed `AccountController.java` providing verified account profile summaries, masked card identifiers, and dual ledger/available balance inquiries.

---

## 2. Detailed Technical Modules

### A. The Four Pillars of OOP in Action

#### 1. Encapsulation
- All monetary attributes (`BigDecimal balance`) are strictly `private`.
- State cannot be modified directly by outside callers. Mutation occurs exclusively via domain methods (`deposit()`, `withdraw()`) that check preconditions:
  ```java
  public abstract class Account implements AccountOperations {
      private final String accountNumber;
      private final Customer owner;
      private BigDecimal balance; // Strictly encapsulated
      
      public synchronized void deposit(BigDecimal amount) throws InvalidAmountException {
          if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
              throw new InvalidAmountException("Deposit amount must be strictly greater than zero.");
          }
          this.balance = this.balance.add(amount);
      }
  }
  ```

#### 2. Inheritance & Polymorphism
- `SavingsAccount` and `CurrentAccount` inherit from `Account`, but exhibit distinct polymorphic behaviors during withdrawal:
  - **`SavingsAccount`**: Enforces a strict minimum balance rule of ₹100.00:
    ```java
    @Override
    public synchronized void withdraw(BigDecimal amount) throws InsufficientFundsException, InvalidAmountException {
        validatePositiveAmount(amount);
        if (getBalance().subtract(amount).compareTo(MINIMUM_BALANCE) < 0) {
            throw new InsufficientFundsException(
                String.format("Savings account requires a minimum balance of ₹%.2f.", MINIMUM_BALANCE)
            );
        }
        setBalance(getBalance().subtract(amount));
    }
    ```
  - **`CurrentAccount`**: Commercial account allowing zero minimum balance (`MINIMUM_BALANCE = 0.00`).
- **Dynamic Method Dispatch**: The web service calls `account.withdraw(amount)` without knowing the concrete subtype at compile-time; Java dynamically executes the appropriate rule at runtime.

#### 3. Abstraction (Interfaces)
- Defined strict behavioural contracts in `src/com/bank/atm/interfaces/`:
  - `AccountOperations.java`: Guarantees `deposit()`, `withdraw()`, `getBalance()`, `getAvailableBalance()`.
  - `CardOperations.java`: Guarantees `verifyPin()`, `changePin()`, `block()`, `isBlocked()`.

#### 4. Custom Exception Hierarchy
- Built typed domain exceptions that prevent silent errors and maintain financial safety:
  ```
  AtmException (Checked base)
  ├── AccountNotFoundException
  ├── CardBlockedException
  ├── CardExpiredException
  ├── InsufficientFundsException
  ├── InvalidAmountException
  └── InvalidPinException
  ```

### B. High-Precision Financial Math (`BigDecimal`)
- Vedika prevented floating-point IEEE 754 precision errors (e.g. `0.1 + 0.2 = 0.30000000000000004`) by exclusively adopting `java.math.BigDecimal` with `RoundingMode.HALF_UP` for all currency calculations.

### C. Account REST API Controller (`AccountController.java`)
- Implemented `/api/account/details` and `/api/account/balance`:
  - Enforces session authentication: callers must possess a valid session matching the authenticated cardholder.
  - Automatically calculates dual ledger views:
    - **Current Balance**: Total ledger balance.
    - **Available Balance**: Ledger balance minus account-specific minimum balance constraint.

---

## 3. Code Files Owned

- `src/com/bank/atm/model/Account.java` (Abstract base class)
- `src/com/bank/atm/model/SavingsAccount.java`
- `src/com/bank/atm/model/CurrentAccount.java`
- `src/com/bank/atm/model/Customer.java`
- `src/com/bank/atm/model/ATMCard.java`
- `src/com/bank/atm/model/TransactionRecord.java`
- `src/com/bank/atm/interfaces/AccountOperations.java`
- `src/com/bank/atm/interfaces/CardOperations.java`
- `src/com/bank/atm/exceptions/*` (all 7 custom exception classes)
- `src/com/bank/atm/controller/AccountController.java`
- `OOP_CONCEPTS.md`

---

## 4. Viva & Presentation Talking Points

1. **How is polymorphism demonstrated in your code?**  
   *Answer*: The base class `Account` defines `abstract void withdraw(BigDecimal amount)`. When a customer initiates a withdrawal, `AtmWebService` invokes `account.withdraw(amount)` on the base reference. If the account is a `SavingsAccount`, it dynamically enforces the ₹100 minimum balance constraint; if it is a `CurrentAccount`, it permits drawing down to ₹0.00.
2. **Why did you use `BigDecimal` instead of `double` or `float`?**  
   *Answer*: `double` and `float` use binary floating-point representation, causing inexact representations of decimals like 0.10. Over multiple financial transactions, this accumulates rounding errors. `BigDecimal` provides arbitrary-precision signed decimal numbers necessary for banking.
3. **What is the difference between checked and unchecked exceptions in your hierarchy?**  
   *Answer*: `AtmException` and its subclasses are checked exceptions, forcing the calling service and web controllers to explicitly handle or translate domain errors (such as insufficient funds or blocked cards) into user-facing API responses.
