package model;

import interfaces.Printable;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Immutable record of one completed action in an account's history.
 *
 * <p>Display format (also returned by {@link #toString()}):
 * <pre>TXN-1004 | WITHDRAWAL | Amount: 500.00 | Balance: 4500.00 | 2026-09-30 15:30</pre>
 */
public class TransactionRecord implements Printable {

    private static final DateTimeFormatter TIMESTAMP_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    /** First generated transaction number, giving IDs such as {@code TXN-1001}. */
    private static final int FIRST_TRANSACTION_NUMBER = 1001;

    /** Shared counter so every record created by {@link #create} gets a unique ID. */
    private static final AtomicInteger NEXT_TRANSACTION_NUMBER =
            new AtomicInteger(FIRST_TRANSACTION_NUMBER);

    private final String transactionId;
    private final TransactionType type;
    private final BigDecimal amount;
    private final LocalDateTime timestamp;
    private final String description;
    private final BigDecimal balanceAfterTransaction;

    /**
     * Creates a record with an explicit timestamp.
     *
     * @param transactionId           unique ID, such as {@code TXN-1001}
     * @param type                    what kind of action this was
     * @param amount                  amount involved ({@link BigDecimal#ZERO} for a PIN change)
     * @param timestamp               when the action completed
     * @param description             short explanation, for example "Transfer to ACC1002"
     * @param balanceAfterTransaction account balance immediately after the action
     * @throws IllegalArgumentException if any argument is null, or the ID is blank
     */
    public TransactionRecord(String transactionId, TransactionType type, BigDecimal amount,
                             LocalDateTime timestamp, String description,
                             BigDecimal balanceAfterTransaction) {
        if (transactionId == null || transactionId.trim().isEmpty()) {
            throw new IllegalArgumentException("Transaction ID must not be empty.");
        }
        if (type == null || amount == null || timestamp == null
                || description == null || balanceAfterTransaction == null) {
            throw new IllegalArgumentException("Transaction details must not be null.");
        }
        this.transactionId = transactionId;
        this.type = type;
        this.amount = amount;
        this.timestamp = timestamp;
        this.description = description;
        this.balanceAfterTransaction = balanceAfterTransaction;
    }

    /**
     * Creates a record stamped with the current time.
     *
     * @see #TransactionRecord(String, TransactionType, BigDecimal, LocalDateTime, String, BigDecimal)
     */
    public TransactionRecord(String transactionId, TransactionType type, BigDecimal amount,
                             String description, BigDecimal balanceAfterTransaction) {
        this(transactionId, type, amount, LocalDateTime.now(), description,
                balanceAfterTransaction);
    }

    /**
     * Factory that creates a record with an automatically generated ID
     * ({@code TXN-1001}, {@code TXN-1002}, ...) and the current time.
     * This is the method {@code Account} uses when recording an action.
     */
    public static TransactionRecord create(TransactionType type, BigDecimal amount,
                                           String description,
                                           BigDecimal balanceAfterTransaction) {
        String id = "TXN-" + NEXT_TRANSACTION_NUMBER.getAndIncrement();
        return new TransactionRecord(id, type, amount, description, balanceAfterTransaction);
    }

    public String getTransactionId() {
        return transactionId;
    }

    public TransactionType getType() {
        return type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getBalanceAfterTransaction() {
        return balanceAfterTransaction;
    }

    /**
     * Prints this record as a single formatted line.
     */
    @Override
    public void printSummary() {
        System.out.println(this);
    }

    /**
     * Formats money with exactly two decimal places for display only;
     * the stored {@link BigDecimal} values are not changed.
     */
    private static String formatMoney(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    @Override
    public String toString() {
        return transactionId
                + " | " + type
                + " | Amount: " + formatMoney(amount)
                + " | Balance: " + formatMoney(balanceAfterTransaction)
                + " | " + timestamp.format(TIMESTAMP_FORMAT);
    }
}
