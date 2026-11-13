package com.bank.atm.model;


import com.bank.atm.exceptions.*;
import com.bank.atm.interfaces.*;
import com.bank.atm.enums.*;
import java.math.BigDecimal;

/**
 * A current (checking) account. The minimum balance is zero, and overdraft is not
 * supported in this version, so the balance can never go negative.
 *
 * <p>Demonstrates <b>inheritance</b> ({@code extends Account}) and <b>polymorphism</b>
 * (the overridden methods return Current-specific values).
 */
public class CurrentAccount extends Account {

    private static final BigDecimal MINIMUM_BALANCE = BigDecimal.ZERO;

    /**
     * @param accountNumber  unique account number, such as {@code ACC1002}
     * @param owner          the account holder
     * @param openingBalance starting balance; must not be negative
     * @throws IllegalArgumentException if the opening balance is invalid (see {@link Account})
     */
    public CurrentAccount(String accountNumber, Customer owner, BigDecimal openingBalance) {
        super(accountNumber, owner, openingBalance);
    }

    @Override
    public String getAccountType() {
        return "Current Account";
    }

    @Override
    public BigDecimal getMinimumBalance() {
        return MINIMUM_BALANCE;
    }
}
