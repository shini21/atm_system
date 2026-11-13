package com.bank.atm.exceptions;

/**
 * Checked exception thrown when an operation is attempted using an expired card.
 */
public class CardExpiredException extends Exception {

    private static final long serialVersionUID = 1L;

    /**
     * @param message a user-friendly description including the card's expiry information
     */
    public CardExpiredException(String message) {
        super(message);
    }
}
