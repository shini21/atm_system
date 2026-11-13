package com.bank.atm.exceptions;

/**
 * Checked exception thrown for an invalid PIN format (not exactly four digits)
 * or for an incorrect PIN.
 */
public class InvalidPinException extends Exception {

    private static final long serialVersionUID = 1L;

    /**
     * @param message a user-friendly description of the PIN problem
     */
    public InvalidPinException(String message) {
        super(message);
    }
}
