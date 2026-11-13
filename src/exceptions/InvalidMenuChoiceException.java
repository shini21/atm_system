package exceptions;

/**
 * Checked exception thrown when a menu input is outside the available choices
 * or cannot be parsed as an integer.
 */
public class InvalidMenuChoiceException extends Exception {

    private static final long serialVersionUID = 1L;

    /**
     * @param message a user-friendly description of the invalid menu input
     */
    public InvalidMenuChoiceException(String message) {
        super(message);
    }
}
