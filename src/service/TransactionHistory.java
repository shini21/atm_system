package service;

import model.Account;
import model.TransactionRecord;

import java.util.ArrayList;
import java.util.List;

/**
 * Formats and prints an account's transaction history.
 *
 * <p>Records are shown newest first, based on the order they were recorded (not on
 * timestamps, because several transactions can happen within the same minute).
 * The account's own history list is only read, never changed.
 */
public class TransactionHistory {

    /** Number of records shown when no limit is given. */
    public static final int DEFAULT_LIMIT = 5;

    /**
     * Prints the {@link #DEFAULT_LIMIT} most recent transactions, newest first.
     *
     * @param account the account whose history to show
     * @throws IllegalArgumentException if {@code account} is null
     */
    public void showLastTransactions(Account account) {
        showLastTransactions(account, DEFAULT_LIMIT);
    }

    /**
     * Prints up to {@code limit} of the most recent transactions, newest first.
     * If the account has no transactions, a helpful message is printed instead.
     *
     * @param account the account whose history to show
     * @param limit   maximum number of records to print; must be at least 1
     * @throws IllegalArgumentException if {@code account} is null or {@code limit} is below 1
     */
    public void showLastTransactions(Account account, int limit) {
        List<TransactionRecord> latest = getLastTransactions(account, limit);

        if (latest.isEmpty()) {
            System.out.println("No transactions found for account "
                    + account.getAccountNumber() + " yet.");
            return;
        }

        System.out.println("Last " + latest.size() + " transaction(s) for account "
                + account.getAccountNumber() + " (newest first):");
        for (TransactionRecord record : latest) {
            record.printSummary();
        }
    }

    /**
     * Returns up to {@code limit} of the most recent transactions, newest first.
     * The result is a new list, so changing it does not affect the account's history.
     *
     * @param account the account whose history to read
     * @param limit   maximum number of records to return; must be at least 1
     * @return the latest records, newest first; empty if there are none
     * @throws IllegalArgumentException if {@code account} is null or {@code limit} is below 1
     */
    public List<TransactionRecord> getLastTransactions(Account account, int limit) {
        if (account == null) {
            throw new IllegalArgumentException("Account must not be null.");
        }
        if (limit < 1) {
            throw new IllegalArgumentException("Limit must be at least 1.");
        }
        List<TransactionRecord> history = account.getTransactionHistory(); // read-only view
        List<TransactionRecord> latest = new ArrayList<>();
        for (int i = history.size() - 1; i >= 0 && latest.size() < limit; i--) {
            latest.add(history.get(i));
        }
        return latest;
    }
}
