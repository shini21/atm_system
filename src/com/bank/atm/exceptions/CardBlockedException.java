package com.bank.atm.exceptions;

/**
 * Checked exception thrown when an operation is attempted using a blocked card.
 */
public class CardBlockedException extends Exception {

    private static final long serialVersionUID = 1L;

    /**
     * @param message a user-friendly description of why the card is blocked
     */
    public CardBlockedException(String message) {
        super(message);
    }
}
