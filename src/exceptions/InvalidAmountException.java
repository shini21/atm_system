package exceptions;

/**
 * Checked exception thrown when a deposit, withdrawal, or transfer amount is
 * zero, negative, not numeric, or otherwise invalid.
 */
public class InvalidAmountException extends Exception {

    private static final long serialVersionUID = 1L;

    /**
     * @param message a user-friendly description of why the amount was rejected
     */
    public InvalidAmountException(String message) {
        super(message);
    }
}
