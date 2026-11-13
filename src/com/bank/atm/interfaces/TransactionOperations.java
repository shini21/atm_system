package com.bank.atm.interfaces;


import com.bank.atm.exceptions.*;
import com.bank.atm.exceptions.InsufficientFundsException;
import com.bank.atm.exceptions.InvalidAmountException;
import com.bank.atm.model.Account;

import java.math.BigDecimal;

/**
 * Contract for the core financial actions that every account must support.
 *
 * <p>All monetary values use {@link BigDecimal}; {@code double} must never be used for money.
 */
public interface TransactionOperations {

    /**
     * Adds money to the account.
     *
     * @param amount the amount to deposit; must be greater than zero
     * @throws InvalidAmountException if the amount is null, zero, or negative
     */
    void deposit(BigDecimal amount) throws InvalidAmountException;

    /**
     * Removes money from the account without breaking the account's minimum balance.
     *
     * @param amount the amount to withdraw; must be greater than zero
     * @throws InvalidAmountException     if the amount is null, zero, or negative
     * @throws InsufficientFundsException if the withdrawal would leave the balance
     *                                    below the account's minimum balance
     */
    void withdraw(BigDecimal amount) throws InvalidAmountException, InsufficientFundsException;

    /**
     * Moves money from this account to another account.
     *
     * @param receiver the account that receives the money
     * @param amount   the amount to transfer; must be greater than zero
     * @throws InvalidAmountException     if the amount is null, zero, or negative
     * @throws InsufficientFundsException if the transfer would leave this account
     *                                    below its minimum balance
     */
    void transfer(Account receiver, BigDecimal amount)
            throws InvalidAmountException, InsufficientFundsException;

    /**
     * Returns the current balance.
     *
     * @return the current balance
     */
    BigDecimal getBalance();
}
