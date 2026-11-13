package model;

import exceptions.InsufficientFundsException;
import exceptions.InvalidAmountException;
import interfaces.Printable;
import interfaces.TransactionOperations;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Abstract base class for all bank accounts.
 *
 * <p>Demonstrates:
 * <ul>
 *   <li><b>Abstraction</b> - cannot be instantiated; subclasses supply
 *       {@link #getAccountType()} and {@link #getMinimumBalance()}.</li>
 *   <li><b>Encapsulation</b> - all fields are private. There is no {@code setBalance()};
 *       the balance changes only through {@link #deposit}, {@link #withdraw} and
 *       {@link #transfer}.</li>
 *   <li><b>Polymorphism</b> - callers hold an {@code Account} reference and get
 *       Savings or Current behaviour depending on the actual object.</li>
 * </ul>
 *
 * <p>All money is {@link BigDecimal} with exactly two decimal places. Amounts with more
 * than two decimal places are rejected rather than silently rounded.
 */
public abstract class Account implements TransactionOperations, Printable {

    private static final int MONEY_SCALE = 2;

    private final String accountNumber;
    private final Customer owner;
    private BigDecimal balance;
    private final List<TransactionRecord> transactionHistory = new ArrayList<>();

    /**
     * Creates an account. Opening a balance is not recorded as a transaction.
     *
     * <p>The constructor calls {@link #getMinimumBalance()}. This is safe because the
     * subclasses in this project return a {@code static final} constant, which is
     * initialised before any instance exists.
     *
     * @param accountNumber unique account number, such as {@code ACC1001}
     * @param owner         the account holder
     * @param openingBalance starting balance; at least the minimum balance, at most two decimals
     * @throws IllegalArgumentException if an argument is null/blank, the balance has more than
     *                                  two decimal places, or it is below the minimum balance
     */
    @SuppressWarnings("this-escape") // getMinimumBalance() only returns a static final constant
    protected Account(String accountNumber, Customer owner, BigDecimal openingBalance) {
        if (accountNumber == null || accountNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Account number must not be empty.");
        }
        if (owner == null) {
            throw new IllegalArgumentException("Account owner must not be null.");
        }
        if (openingBalance == null || openingBalance.stripTrailingZeros().scale() > MONEY_SCALE) {
            throw new IllegalArgumentException(
                    "Opening balance is required and may have at most 2 decimal places.");
        }
        BigDecimal normalisedBalance = openingBalance.setScale(MONEY_SCALE);
        if (normalisedBalance.compareTo(getMinimumBalance()) < 0) {
            throw new IllegalArgumentException(
                    "Opening balance must be at least the minimum balance of "
                            + formatMoney(getMinimumBalance()) + ".");
        }
        this.accountNumber = accountNumber.trim();
        this.owner = owner;
        this.balance = normalisedBalance;
    }

    // ---------------------------------------------------------------------
    // Abstract behaviour - each account type defines its own answer
    // ---------------------------------------------------------------------

    /**
     * @return a display name for the kind of account, such as "Savings Account"
     */
    public abstract String getAccountType();

    /**
     * @return the balance this account must always keep after any withdrawal or transfer
     */
    public abstract BigDecimal getMinimumBalance();

    // ---------------------------------------------------------------------
    // Read-only accessors
    // ---------------------------------------------------------------------

    public String getAccountNumber() {
        return accountNumber;
    }

    public Customer getOwner() {
        return owner;
    }

    @Override
    public BigDecimal getBalance() {
        return balance;
    }

    /**
     * @return the amount that can currently be withdrawn or transferred, that is, the
     *         balance minus the minimum balance
     */
    public BigDecimal getAvailableBalance() {
        return balance.subtract(getMinimumBalance());
    }

    /**
     * Returns the history oldest-first as a read-only view, so callers can read
     * it but cannot change it. Use {@link #addTransaction} to add records.
     *
     * @return an unmodifiable view of the transaction history
     */
    public List<TransactionRecord> getTransactionHistory() {
        return Collections.unmodifiableList(transactionHistory);
    }

    // ---------------------------------------------------------------------
    // Financial operations
    // ---------------------------------------------------------------------

    @Override
    public void deposit(BigDecimal amount) throws InvalidAmountException {
        BigDecimal validAmount = validateAmount(amount);
        balance = balance.add(validAmount);
        recordTransaction(TransactionType.DEPOSIT, validAmount, "Cash deposit");
    }

    @Override
    public void withdraw(BigDecimal amount)
            throws InvalidAmountException, InsufficientFundsException {
        BigDecimal validAmount = validateAmount(amount);
        ensureSufficientFunds(validAmount);
        balance = balance.subtract(validAmount);
        recordTransaction(TransactionType.WITHDRAWAL, validAmount, "Cash withdrawal");
    }

    /**
     * Moves money to another account. All checks happen before either balance is
     * touched, so a failed transfer leaves both accounts unchanged.
     * The sender gets a {@code TRANSFER_OUT} record and the receiver a {@code TRANSFER_IN} record.
     *
     * @throws InvalidAmountException     if the amount is invalid, or the receiver is this same account
     * @throws InsufficientFundsException if the sender would drop below its minimum balance
     * @throws IllegalArgumentException   if {@code receiver} is null (a programming error)
     */
    @Override
    public void transfer(Account receiver, BigDecimal amount)
            throws InvalidAmountException, InsufficientFundsException {
        if (receiver == null) {
            throw new IllegalArgumentException("Receiver account must not be null.");
        }
        BigDecimal validAmount = validateAmount(amount);
        if (receiver == this || receiver.accountNumber.equals(accountNumber)) {
            throw new InvalidAmountException("Cannot transfer money to the same account.");
        }
        ensureSufficientFunds(validAmount);

        balance = balance.subtract(validAmount);
        recordTransaction(TransactionType.TRANSFER_OUT, validAmount,
                "Transfer to " + receiver.accountNumber);
        receiver.receiveTransfer(validAmount, accountNumber);
    }

    /**
     * Adds a record to this account's history. Used internally for money movements and by
     * the ATM for events that move no money, such as a PIN change.
     *
     * @param record the record to append; must not be null
     * @throws IllegalArgumentException if {@code record} is null
     */
    public void addTransaction(TransactionRecord record) {
        if (record == null) {
            throw new IllegalArgumentException("Transaction record must not be null.");
        }
        transactionHistory.add(record);
    }

    // ---------------------------------------------------------------------
    // Display
    // ---------------------------------------------------------------------

    @Override
    public void printSummary() {
        System.out.println("Account Number  : " + accountNumber);
        System.out.println("Account Type    : " + getAccountType());
        System.out.println("Account Holder  : " + owner.getFullName());
        System.out.println("Balance         : " + formatMoney(balance));
        System.out.println("Minimum Balance : " + formatMoney(getMinimumBalance()));
    }

    @Override
    public String toString() {
        return accountNumber + " (" + getAccountType() + ")";
    }

    // ---------------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------------

    /**
     * Credits this account for an incoming transfer. Private on purpose: the only way
     * to reach it is through the sender's {@link #transfer}, which has already validated it.
     */
    private void receiveTransfer(BigDecimal amount, String senderAccountNumber) {
        balance = balance.add(amount);
        recordTransaction(TransactionType.TRANSFER_IN, amount,
                "Transfer from " + senderAccountNumber);
    }

    /**
     * Checks that an amount is present, positive, and has at most two decimal places.
     *
     * @return the amount normalised to two decimal places
     */
    private static BigDecimal validateAmount(BigDecimal amount) throws InvalidAmountException {
        if (amount == null) {
            throw new InvalidAmountException("Amount is required.");
        }
        if (amount.signum() <= 0) {
            throw new InvalidAmountException("Amount must be greater than zero.");
        }
        if (amount.stripTrailingZeros().scale() > MONEY_SCALE) {
            throw new InvalidAmountException("Amount can have at most 2 decimal places.");
        }
        return amount.setScale(MONEY_SCALE);
    }

    /**
     * Enforces the minimum-balance rule for withdrawals and transfers.
     */
    private void ensureSufficientFunds(BigDecimal amount) throws InsufficientFundsException {
        BigDecimal available = getAvailableBalance();
        if (amount.compareTo(available) > 0) {
            throw new InsufficientFundsException(available, amount);
        }
    }

    /**
     * Records a completed action using the balance as it is right now,
     * so call this after the balance has been updated.
     */
    private void recordTransaction(TransactionType type, BigDecimal amount, String description) {
        addTransaction(TransactionRecord.create(type, amount, description, balance));
    }

    private static String formatMoney(BigDecimal value) {
        return value.setScale(MONEY_SCALE, RoundingMode.HALF_UP).toPlainString();
    }
}
