package model;

import exceptions.CardBlockedException;
import exceptions.CardExpiredException;
import exceptions.InvalidPinException;
import interfaces.Authenticatable;
import interfaces.Printable;

import java.time.LocalDate;

/**
 * Abstract base class for all bank cards.
 *
 * <p>Demonstrates:
 * <ul>
 *   <li><b>Abstraction</b> - subclasses decide what "valid" means via {@link #isValid()}.</li>
 *   <li><b>Encapsulation</b> - the PIN, blocked flag and attempt counter are private.
 *       There is no PIN getter, and the blocked flag changes only through failed
 *       attempts or {@link #block()}.</li>
 *   <li><b>Interfaces</b> - implements {@link Authenticatable} and {@link Printable}.</li>
 * </ul>
 *
 * <p>PIN rules: exactly four digits; three failed attempts block the card; a successful
 * verification resets the failed-attempt counter to zero.
 *
 * <p><b>Simulation note:</b> the PIN is stored as plain text for simplicity. A real system
 * must store only a salted hash and never keep or display PINs in plain text.
 */
public abstract class Card implements Authenticatable, Printable {

    /** Number of failed PIN attempts that blocks the card. */
    public static final int MAX_FAILED_ATTEMPTS = 3;

    private static final int PIN_LENGTH = 4;

    private final String cardNumber;
    private String pin;
    private final LocalDate expiryDate;
    private boolean blocked;
    private int failedPinAttempts;

    /**
     * Creates an active (unblocked) card with no failed attempts.
     *
     * @param cardNumber unique card number, such as {@code CARD1001}
     * @param pin        initial PIN, exactly four digits
     * @param expiryDate last day the card is valid (inclusive)
     * @throws IllegalArgumentException if an argument is null/blank or the PIN is not four digits
     */
    protected Card(String cardNumber, String pin, LocalDate expiryDate) {
        if (cardNumber == null || cardNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Card number must not be empty.");
        }
        if (!isValidPinFormat(pin)) {
            throw new IllegalArgumentException("Initial PIN must be exactly 4 digits.");
        }
        if (expiryDate == null) {
            throw new IllegalArgumentException("Expiry date must not be null.");
        }
        this.cardNumber = cardNumber.trim();
        this.pin = pin;
        this.expiryDate = expiryDate;
    }

    // ---------------------------------------------------------------------
    // Abstract behaviour
    // ---------------------------------------------------------------------

    /**
     * Checks that the card may be used right now.
     *
     * @return {@code true} if the card is neither blocked nor expired
     * @throws CardBlockedException if the card is blocked
     * @throws CardExpiredException if the card has expired
     */
    public abstract boolean isValid() throws CardBlockedException, CardExpiredException;

    // ---------------------------------------------------------------------
    // Authenticatable
    // ---------------------------------------------------------------------

    /**
     * Verifies a PIN and tracks failed attempts.
     *
     * <ul>
     *   <li>Correct PIN: the failed-attempt counter resets to zero and {@code true} is returned.</li>
     *   <li>Malformed or incorrect PIN: counts as a failed attempt and an
     *       {@link InvalidPinException} is thrown. The third failure blocks the card.</li>
     *   <li>Already-blocked card: always rejected, even with the correct PIN, and the
     *       counter is not touched.</li>
     * </ul>
     *
     * @throws InvalidPinException if the PIN is malformed, incorrect, or the card is blocked
     */
    @Override
    public boolean verifyPin(String enteredPin) throws InvalidPinException {
        if (blocked) {
            throw new InvalidPinException("Card is blocked. PIN verification is not allowed.");
        }
        if (!isValidPinFormat(enteredPin)) {
            throw registerFailedAttempt("Invalid PIN format. PIN must be exactly 4 digits.");
        }
        if (!pin.equals(enteredPin)) {
            throw registerFailedAttempt("Incorrect PIN.");
        }
        failedPinAttempts = 0;
        return true;
    }

    /**
     * Changes the PIN. The old PIN is verified first through {@link #verifyPin(String)},
     * so a wrong old PIN counts as a failed attempt just like at login.
     * A malformed new PIN is rejected without counting as a failed attempt.
     *
     * @throws InvalidPinException if the old PIN is wrong, the card is blocked,
     *                             or the new PIN is not exactly four digits
     */
    @Override
    public void changePin(String oldPin, String newPin) throws InvalidPinException {
        verifyPin(oldPin);
        if (!isValidPinFormat(newPin)) {
            throw new InvalidPinException("New PIN must be exactly 4 digits.");
        }
        pin = newPin;
    }

    /**
     * Checks the PIN format only; it does not compare against any stored PIN.
     *
     * @return {@code true} if the value is non-null and is exactly four digits (0-9)
     */
    public static boolean isValidPinFormat(String candidate) {
        if (candidate == null || candidate.length() != PIN_LENGTH) {
            return false;
        }
        for (int i = 0; i < candidate.length(); i++) {
            char c = candidate.charAt(i);
            if (c < '0' || c > '9') {
                return false;
            }
        }
        return true;
    }

    // ---------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------

    public String getCardNumber() {
        return cardNumber;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public boolean isBlocked() {
        return blocked;
    }

    public int getFailedPinAttempts() {
        return failedPinAttempts;
    }

    /**
     * @return how many more wrong PINs are allowed before the card is blocked
     */
    public int getRemainingAttempts() {
        return Math.max(0, MAX_FAILED_ATTEMPTS - failedPinAttempts);
    }

    /**
     * Blocks the card manually (for example, a card reported lost). There is no
     * unblock method in this version; unblocking would be a bank-staff feature.
     */
    public void block() {
        blocked = true;
    }

    /**
     * Unblocks the card and resets failed PIN attempts (bank-staff / demo feature).
     */
    public void unblock() {
        this.blocked = false;
        this.failedPinAttempts = 0;
    }

    /**
     * @return {@code true} if today is after the expiry date; the expiry date itself is still valid
     */
    public boolean isExpired() {
        return isExpiredOn(LocalDate.now());
    }

    /**
     * @param date the date to check against
     * @return {@code true} if {@code date} is after the expiry date
     */
    public boolean isExpiredOn(LocalDate date) {
        return date.isAfter(expiryDate);
    }

    // ---------------------------------------------------------------------
    // Display
    // ---------------------------------------------------------------------

    /**
     * Prints card details. The PIN is never printed.
     */
    @Override
    public void printSummary() {
        System.out.println("Card Number : " + cardNumber);
        System.out.println("Expiry Date : " + expiryDate);
        System.out.println("Status      : " + getStatus());
    }

    @Override
    public String toString() {
        return cardNumber;
    }

    // ---------------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------------

    private String getStatus() {
        if (blocked) {
            return "BLOCKED";
        }
        return isExpired() ? "EXPIRED" : "ACTIVE";
    }

    /**
     * Counts one failed attempt, blocks the card on the third, and builds the exception to throw.
     */
    private InvalidPinException registerFailedAttempt(String reason) {
        failedPinAttempts++;
        if (failedPinAttempts >= MAX_FAILED_ATTEMPTS) {
            blocked = true;
            return new InvalidPinException(reason + " Card has been blocked after "
                    + MAX_FAILED_ATTEMPTS + " failed attempts.");
        }
        return new InvalidPinException(reason + " " + getRemainingAttempts()
                + " attempt(s) remaining.");
    }
}
