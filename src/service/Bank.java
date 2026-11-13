package service;

import exceptions.AccountNotFoundException;
import model.ATMCard;
import model.Account;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * In-memory data repository and backend for the ATM.
 *
 * <p>Demonstrates <b>collections</b> ({@link HashMap} for fast lookup by number) and
 * <b>encapsulation</b>: both maps are private and are never returned or exposed.
 * Outside code can only add items and look them up through the methods below.
 *
 * <p>Account and card numbers are matched ignoring case and surrounding spaces,
 * so {@code " card1001 "} finds {@code CARD1001}.
 *
 * <p>The accounts and cards live in memory only. Nothing is saved when the program exits.
 */
public class Bank {

    private final Map<String, Account> accounts = new HashMap<>();
    private final Map<String, ATMCard> cards = new HashMap<>();

    /**
     * Registers an account.
     *
     * @param account the account to add
     * @throws IllegalArgumentException if the account is null or its number is already registered
     */
    public void addAccount(Account account) {
        if (account == null) {
            throw new IllegalArgumentException("Account must not be null.");
        }
        String key = normalise(account.getAccountNumber());
        if (accounts.containsKey(key)) {
            throw new IllegalArgumentException(
                    "Account " + account.getAccountNumber() + " is already registered.");
        }
        accounts.put(key, account);
    }

    /**
     * Registers a card. The linked account does not have to be registered yet;
     * it is only looked up when {@link #getAccountForCard(ATMCard)} is called.
     *
     * @param card the card to add
     * @throws IllegalArgumentException if the card is null or its number is already registered
     */
    public void addCard(ATMCard card) {
        if (card == null) {
            throw new IllegalArgumentException("Card must not be null.");
        }
        String key = normalise(card.getCardNumber());
        if (cards.containsKey(key)) {
            throw new IllegalArgumentException(
                    "Card " + card.getCardNumber() + " is already registered.");
        }
        cards.put(key, card);
    }

    /**
     * Finds an account by its number.
     *
     * @param accountNumber the account number typed by the user
     * @return the matching account
     * @throws AccountNotFoundException if the number is empty or no such account exists
     */
    public Account findAccountByNumber(String accountNumber) throws AccountNotFoundException {
        if (isBlank(accountNumber)) {
            throw new AccountNotFoundException("No account number was entered.");
        }
        Account account = accounts.get(normalise(accountNumber));
        if (account == null) {
            throw new AccountNotFoundException(
                    "Account " + accountNumber.trim() + " was not found.");
        }
        return account;
    }

    /**
     * Finds a card by its number.
     *
     * @param cardNumber the card number typed by the user
     * @return the matching card
     * @throws AccountNotFoundException if the number is empty or no such card exists
     */
    public ATMCard findCardByNumber(String cardNumber) throws AccountNotFoundException {
        if (isBlank(cardNumber)) {
            throw new AccountNotFoundException("No card number was entered.");
        }
        ATMCard card = cards.get(normalise(cardNumber));
        if (card == null) {
            throw new AccountNotFoundException("Card " + cardNumber.trim() + " was not found.");
        }
        return card;
    }

    /**
     * Returns the account linked to a card.
     *
     * @param card a card obtained from this bank
     * @return the linked account
     * @throws AccountNotFoundException if no account is registered under the card's linked number
     * @throws IllegalArgumentException if {@code card} is null (a programming error)
     */
    public Account getAccountForCard(ATMCard card) throws AccountNotFoundException {
        if (card == null) {
            throw new IllegalArgumentException("Card must not be null.");
        }
        Account account = accounts.get(normalise(card.getLinkedAccountNumber()));
        if (account == null) {
            throw new AccountNotFoundException("No account found for card " + card.getCardNumber()
                    + " (linked account " + card.getLinkedAccountNumber() + ").");
        }
        return account;
    }

    /**
     * Lists the registered card numbers so the ATM can show them as demo choices.
     * The list is a sorted copy: changing it does not affect the bank's data.
     *
     * @return the card numbers in alphabetical order
     */
    public List<String> getCardNumbers() {
        List<String> numbers = new ArrayList<>();
        for (ATMCard card : cards.values()) {
            numbers.add(card.getCardNumber());
        }
        Collections.sort(numbers);
        return numbers;
    }

    // ---------------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------------

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    /**
     * Builds the map key: trimmed and upper-case, so lookups ignore case and spaces.
     */
    private static String normalise(String number) {
        return number.trim().toUpperCase(Locale.ROOT);
    }
}
