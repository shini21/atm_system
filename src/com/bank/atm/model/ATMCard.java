package com.bank.atm.model;


import com.bank.atm.interfaces.*;
import com.bank.atm.exceptions.*;
import com.bank.atm.exceptions.CardBlockedException;
import com.bank.atm.exceptions.CardExpiredException;

import java.time.LocalDate;

/**
 * The simulated ATM card inserted into the machine. Each card is linked to exactly
 * one primary account, identified by account number.
 *
 * <p>Demonstrates <b>inheritance</b> ({@code extends Card}) and <b>polymorphism</b>
 * (a concrete implementation of the abstract {@link #isValid()}).
 */
public class ATMCard extends Card {

    private final String linkedAccountNumber;

    /**
     * @param cardNumber          unique card number, such as {@code CARD1001}
     * @param pin                 initial PIN, exactly four digits
     * @param expiryDate          last day the card is valid (inclusive)
     * @param linkedAccountNumber account number this card gives access to, such as {@code ACC1001}
     * @throws IllegalArgumentException if any argument is invalid (see {@link Card})
     *                                  or the linked account number is blank
     */
    public ATMCard(String cardNumber, String pin, LocalDate expiryDate,
                   String linkedAccountNumber) {
        super(cardNumber, pin, expiryDate);
        if (linkedAccountNumber == null || linkedAccountNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Linked account number must not be empty.");
        }
        this.linkedAccountNumber = linkedAccountNumber.trim();
    }

    /**
     * Checks the blocked state first, then the expiry date.
     *
     * @return {@code true} if the card is usable
     * @throws CardBlockedException if the card is blocked
     * @throws CardExpiredException if the card has expired
     */
    @Override
    public boolean isValid() throws CardBlockedException, CardExpiredException {
        if (isBlocked()) {
            throw new CardBlockedException("Card " + getCardNumber()
                    + " is blocked. Please contact your bank.");
        }
        if (isExpired()) {
            throw new CardExpiredException("Card " + getCardNumber()
                    + " expired on " + getExpiryDate() + ".");
        }
        return true;
    }

    public String getLinkedAccountNumber() {
        return linkedAccountNumber;
    }

    /**
     * Prints the common card details plus the linked account number.
     */
    @Override
    public void printSummary() {
        super.printSummary();
        System.out.println("Linked Acct : " + linkedAccountNumber);
    }
}
