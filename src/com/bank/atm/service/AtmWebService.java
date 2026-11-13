package com.bank.atm.service;

import exceptions.AccountNotFoundException;
import exceptions.CardBlockedException;
import exceptions.CardExpiredException;
import exceptions.InsufficientFundsException;
import exceptions.InvalidAmountException;
import exceptions.InvalidPinException;
import jakarta.servlet.http.HttpSession;
import model.ATMCard;
import model.Account;
import model.TransactionRecord;
import model.TransactionType;
import org.springframework.stereotype.Service;
import service.Bank;
import service.TransactionHistory;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service orchestrating ATM web operations and managing session-backed state.
 * Reuses the existing {@link Bank}, {@link Account}, {@link ATMCard}, and {@link TransactionHistory}.
 */
@Service
public class AtmWebService {

    public static final String SESSION_CARD_NUMBER = "AUTH_CARD_NUMBER";
    public static final String SESSION_ACCOUNT_NUMBER = "AUTH_ACCOUNT_NUMBER";

    private final Bank bank;
    private final TransactionHistory transactionHistory;

    public AtmWebService(Bank bank, TransactionHistory transactionHistory) {
        this.bank = bank;
        this.transactionHistory = transactionHistory;
    }

    /**
     * Inspects a card without authenticating. Checks whether the card exists,
     * whether it is blocked, and whether it has expired.
     */
    public ATMCard checkCard(String cardNumber)
            throws AccountNotFoundException, CardBlockedException, CardExpiredException {
        if (cardNumber == null || cardNumber.trim().isEmpty()) {
            throw new AccountNotFoundException("Card number must not be empty.");
        }
        ATMCard card = bank.findCardByNumber(cardNumber.trim());
        card.isValid(); // Throws CardBlockedException or CardExpiredException if invalid
        return card;
    }

    /**
     * Authenticates the user with card number and 4-digit PIN.
     * On success, records authentication state in the server-side HTTP session.
     */
    public Account login(String cardNumber, String pin, HttpSession session)
            throws AccountNotFoundException, CardBlockedException, CardExpiredException, InvalidPinException {
        ATMCard card = checkCard(cardNumber);
        card.verifyPin(pin); // Throws InvalidPinException if incorrect, handles attempt counters

        Account account = bank.getAccountForCard(card);
        session.setAttribute(SESSION_CARD_NUMBER, card.getCardNumber());
        session.setAttribute(SESSION_ACCOUNT_NUMBER, account.getAccountNumber());
        return account;
    }

    /**
     * Retrieves the currently authenticated account from the active session.
     */
    public Account getAuthenticatedAccount(HttpSession session) throws AccountNotFoundException {
        String accountNumber = (String) session.getAttribute(SESSION_ACCOUNT_NUMBER);
        if (accountNumber == null) {
            throw new IllegalStateException("No active ATM session found. Please insert your card and log in.");
        }
        return bank.findAccountByNumber(accountNumber);
    }

    /**
     * Retrieves the currently authenticated card from the active session.
     */
    public ATMCard getAuthenticatedCard(HttpSession session) throws AccountNotFoundException {
        String cardNumber = (String) session.getAttribute(SESSION_CARD_NUMBER);
        if (cardNumber == null) {
            throw new IllegalStateException("No active ATM session found. Please insert your card and log in.");
        }
        return bank.findCardByNumber(cardNumber);
    }

    /**
     * Invalidates the active HTTP session.
     */
    public void logout(HttpSession session) {
        if (session != null) {
            session.invalidate();
        }
    }

    /**
     * Deposits money into the authenticated account. Thread-safe synchronization on the account.
     */
    public TransactionRecord deposit(BigDecimal amount, HttpSession session)
            throws AccountNotFoundException, InvalidAmountException {
        Account account = getAuthenticatedAccount(session);
        synchronized (account) {
            account.deposit(amount);
            List<TransactionRecord> history = account.getTransactionHistory();
            return history.get(history.size() - 1);
        }
    }

    /**
     * Withdraws money from the authenticated account. Thread-safe synchronization on the account.
     */
    public TransactionRecord withdraw(BigDecimal amount, HttpSession session)
            throws AccountNotFoundException, InvalidAmountException, InsufficientFundsException {
        Account account = getAuthenticatedAccount(session);
        synchronized (account) {
            account.withdraw(amount);
            List<TransactionRecord> history = account.getTransactionHistory();
            return history.get(history.size() - 1);
        }
    }

    /**
     * Transfers money from the authenticated account to a recipient account.
     */
    public TransactionRecord transfer(String recipientAccountNumber, BigDecimal amount, HttpSession session)
            throws AccountNotFoundException, InvalidAmountException, InsufficientFundsException {
        Account sender = getAuthenticatedAccount(session);
        Account receiver = bank.findAccountByNumber(recipientAccountNumber);

        // Lock accounts in consistent order to prevent deadlock
        Account firstLock = sender.getAccountNumber().compareTo(receiver.getAccountNumber()) < 0 ? sender : receiver;
        Account secondLock = firstLock == sender ? receiver : sender;

        synchronized (firstLock) {
            synchronized (secondLock) {
                sender.transfer(receiver, amount);
                List<TransactionRecord> history = sender.getTransactionHistory();
                return history.get(history.size() - 1);
            }
        }
    }

    /**
     * Changes the card PIN after verifying the old one.
     */
    public void changePin(String oldPin, String newPin, String confirmPin, HttpSession session)
            throws AccountNotFoundException, InvalidPinException {
        if (!newPin.equals(confirmPin)) {
            throw new InvalidPinException("New PIN and Confirm PIN do not match.");
        }
        ATMCard card = getAuthenticatedCard(session);
        Account account = getAuthenticatedAccount(session);

        synchronized (card) {
            card.changePin(oldPin, newPin);
            account.addTransaction(TransactionRecord.create(
                    TransactionType.PIN_CHANGE,
                    BigDecimal.ZERO,
                    "PIN changed via Web ATM",
                    account.getBalance()
            ));
        }
    }

    /**
     * Returns the latest transactions (newest first).
     */
    public List<TransactionRecord> getRecentTransactions(HttpSession session, int limit)
            throws AccountNotFoundException {
        Account account = getAuthenticatedAccount(session);
        return transactionHistory.getLastTransactions(account, limit);
    }

    /**
     * Masks card numbers (e.g. "CARD1001" -> "**** **** 1001").
     */
    public static String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) {
            return "****";
        }
        String lastFour = cardNumber.substring(cardNumber.length() - 4);
        return "**** **** " + lastFour;
    }
}

