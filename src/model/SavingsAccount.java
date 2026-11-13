package model;

import java.math.BigDecimal;

/**
 * A savings account. It must always keep a minimum balance of 100.00.
 *
 * <p>Demonstrates <b>inheritance</b> ({@code extends Account}) and <b>polymorphism</b>
 * (the overridden methods return Savings-specific values).
 */
public class SavingsAccount extends Account {

    private static final BigDecimal MINIMUM_BALANCE = new BigDecimal("100.00");

    /**
     * @param accountNumber  unique account number, such as {@code ACC1001}
     * @param owner          the account holder
     * @param openingBalance starting balance; must be at least 100.00
     * @throws IllegalArgumentException if the opening balance is invalid (see {@link Account})
     */
    public SavingsAccount(String accountNumber, Customer owner, BigDecimal openingBalance) {
        super(accountNumber, owner, openingBalance);
    }

    @Override
    public String getAccountType() {
        return "Savings Account";
    }

    @Override
    public BigDecimal getMinimumBalance() {
        return MINIMUM_BALANCE;
    }
}
