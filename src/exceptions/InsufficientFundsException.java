package exceptions;

import java.math.BigDecimal;

/**
 * Checked exception thrown when a withdrawal or transfer would reduce the
 * balance below the account's required minimum balance.
 */
public class InsufficientFundsException extends Exception {

    private static final long serialVersionUID = 1L;

    private final BigDecimal available;
    private final BigDecimal requested;

    public InsufficientFundsException(String message) {
        super(message);
        this.available = BigDecimal.ZERO;
        this.requested = BigDecimal.ZERO;
    }

    /**
     * @param available the amount that can currently be withdrawn
     * @param requested the amount the user tried to withdraw or transfer
     */
    public InsufficientFundsException(BigDecimal available, BigDecimal requested) {
        super("Insufficient funds. Available: " + available + ", requested: " + requested);
        this.available = available;
        this.requested = requested;
    }

    /**
     * @return the amount that was available when the operation was attempted
     */
    public BigDecimal getAvailable() {
        return available;
    }

    /**
     * @return the amount that the user requested
     */
    public BigDecimal getRequested() {
        return requested;
    }
}
