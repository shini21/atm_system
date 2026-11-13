package com.bank.atm.util;

import com.bank.atm.exceptions.InvalidAmountException;
import com.bank.atm.exceptions.InvalidMenuChoiceException;
import com.bank.atm.model.Card;

import java.math.BigDecimal;
import java.util.regex.Pattern;

/**
 * Central place for validating and parsing raw console input, so the {@code ATM}
 * class does not repeat parsing logic.
 *
 * <p>Every method turns bad input into a user-friendly checked exception
 * instead of letting a {@link NumberFormatException} escape.
 */
public final class InputValidator {

    private static final int MONEY_SCALE = 2;

    /** Digits with an optional leading minus and optional decimals. No exponents, commas or spaces. */
    private static final Pattern AMOUNT_PATTERN = Pattern.compile("-?\\d+(\\.\\d+)?");

    /** Whole number with an optional leading minus. */
    private static final Pattern INTEGER_PATTERN = Pattern.compile("-?\\d+");

    private InputValidator() {
        // Utility class: not meant to be instantiated.
    }

    /**
     * Checks that a PIN is exactly four digits. The rule itself lives in
     * {@link Card#isValidPinFormat(String)} so it is defined in one place only.
     *
     * @param pin the PIN to check; may be null
     * @return {@code true} if the PIN is exactly four digits
     */
    public static boolean isValidPinFormat(String pin) {
        return Card.isValidPinFormat(pin);
    }

    /**
     * Parses a money amount typed by the user.
     *
     * <p>Accepted: plain numbers such as {@code 500} or {@code 250.75}, greater than zero,
     * with at most two decimal places. Rejected: empty input, text, exponent notation
     * ({@code 1e3}), commas, zero, negative numbers, and more than two decimals.
     *
     * @param input the raw text typed by the user; may be null
     * @return the amount as a {@link BigDecimal} with exactly two decimal places
     * @throws InvalidAmountException if the input is not a valid positive amount
     */
    public static BigDecimal parsePositiveAmount(String input) throws InvalidAmountException {
        if (input == null || input.trim().isEmpty()) {
            throw new InvalidAmountException("Amount is required.");
        }
        String text = input.trim();
        if (!AMOUNT_PATTERN.matcher(text).matches()) {
            throw new InvalidAmountException(
                    "Amount must be a number such as 500 or 250.75 (digits only).");
        }
        BigDecimal amount = new BigDecimal(text);
        if (amount.signum() <= 0) {
            throw new InvalidAmountException("Amount must be greater than zero.");
        }
        if (amount.stripTrailingZeros().scale() > MONEY_SCALE) {
            throw new InvalidAmountException("Amount can have at most 2 decimal places.");
        }
        return amount.setScale(MONEY_SCALE);
    }

    /**
     * Parses a menu choice as a whole number, without checking which numbers the menu offers.
     *
     * @param input the raw text typed by the user; may be null
     * @return the number typed
     * @throws InvalidMenuChoiceException if the input is empty, not a whole number, or too large
     */
    public static int parseMenuChoice(String input) throws InvalidMenuChoiceException {
        if (input == null || input.trim().isEmpty()) {
            throw new InvalidMenuChoiceException("Please enter a menu number.");
        }
        String text = input.trim();
        if (!INTEGER_PATTERN.matcher(text).matches()) {
            throw new InvalidMenuChoiceException("Please enter a whole number.");
        }
        try {
            return Integer.parseInt(text);
        } catch (NumberFormatException e) {
            // The text is all digits but too large for an int, so it cannot be a menu option.
            throw new InvalidMenuChoiceException("That number is too large.");
        }
    }

    /**
     * Parses a menu choice and checks that it is between {@code min} and {@code max} inclusive.
     *
     * @param input the raw text typed by the user; may be null
     * @param min   the lowest valid choice
     * @param max   the highest valid choice
     * @return the valid choice
     * @throws InvalidMenuChoiceException if the input is not a whole number or is out of range
     */
    public static int parseMenuChoice(String input, int min, int max)
            throws InvalidMenuChoiceException {
        int choice = parseMenuChoice(input);
        if (choice < min || choice > max) {
            throw new InvalidMenuChoiceException(
                    "Please choose a number between " + min + " and " + max + ".");
        }
        return choice;
    }
}
