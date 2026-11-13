package exceptions;

/**
 * Checked exception thrown when a requested account or card cannot be found
 * in the bank repository.
 */
public class AccountNotFoundException extends Exception {

    private static final long serialVersionUID = 1L;

    /**
     * @param message a user-friendly description of what could not be found
     */
    public AccountNotFoundException(String message) {
        super(message);
    }
}
