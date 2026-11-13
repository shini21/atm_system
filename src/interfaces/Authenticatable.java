package interfaces;

import exceptions.InvalidPinException;

/**
 * Contract for anything that can be secured by a 4-digit PIN (for example, an ATM card).
 *
 * <p>Rules every implementation must follow:
 * <ul>
 *   <li>A PIN is valid only if it is exactly four digits.</li>
 *   <li>Malformed or incorrect PINs are reported with {@link InvalidPinException}.</li>
 *   <li>{@link #changePin(String, String)} must verify the old PIN before replacing it.</li>
 * </ul>
 *
 * <p>Note: PINs are stored in plain text only because this is a classroom simulation.
 * A real system must never store or display PINs in plain text.
 */
public interface Authenticatable {

    /**
     * Verifies the supplied PIN.
     *
     * @param pin the PIN entered by the user
     * @return {@code true} if the PIN matches; an incorrect or malformed PIN is never
     *         reported by returning {@code false} but by throwing an exception
     * @throws InvalidPinException if the PIN format is invalid or the PIN is incorrect
     */
    boolean verifyPin(String pin) throws InvalidPinException;

    /**
     * Replaces the current PIN after verifying the old one.
     *
     * @param oldPin the current PIN, which must be verified first
     * @param newPin the new 4-digit PIN
     * @throws InvalidPinException if the old PIN is wrong or the new PIN format is invalid
     */
    void changePin(String oldPin, String newPin) throws InvalidPinException;
}
