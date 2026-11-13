package com.bank.atm.service;


import com.bank.atm.model.*;
import com.bank.atm.interfaces.*;
import com.bank.atm.exceptions.*;
import com.bank.atm.enums.*;
import com.bank.atm.exceptions.AccountNotFoundException;
import com.bank.atm.exceptions.CardBlockedException;
import com.bank.atm.exceptions.CardExpiredException;
import com.bank.atm.exceptions.InsufficientFundsException;
import com.bank.atm.exceptions.InvalidAmountException;
import com.bank.atm.exceptions.InvalidPinException;
import jakarta.servlet.http.HttpSession;
import com.bank.atm.model.ATMCard;
import com.bank.atm.model.Account;
import com.bank.atm.model.TransactionRecord;
import com.bank.atm.enums.TransactionType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

/**
 * Service orchestrating ATM web operations and managing session-backed state.
 * Bridges in-memory {@link Bank} with persistent {@link AtmPersistenceService}.
 */
@Service
public class AtmWebService {

    public static final String SESSION_CARD_NUMBER = "AUTH_CARD_NUMBER";
    public static final String SESSION_ACCOUNT_NUMBER = "AUTH_ACCOUNT_NUMBER";

    private final Bank bank;
    private final TransactionHistory transactionHistory;
    private final AtmPersistenceService persistenceService;

    public AtmWebService(Bank bank, TransactionHistory transactionHistory) {
        this(bank, transactionHistory, null);
    }

    @Autowired
    public AtmWebService(Bank bank, TransactionHistory transactionHistory,
                         @Autowired(required = false) AtmPersistenceService persistenceService) {
        this.bank = bank;
        this.transactionHistory = transactionHistory;
        this.persistenceService = persistenceService;
    }

    public ATMCard checkCard(String cardNumber)
            throws AccountNotFoundException, CardBlockedException, CardExpiredException {
        if (cardNumber == null || cardNumber.trim().isEmpty()) {
            throw new AccountNotFoundException("Card number must not be empty.");
        }
        if (persistenceService != null) {
            persistenceService.checkCard(cardNumber.trim());
        }
        ATMCard card = bank.findCardByNumber(cardNumber.trim());
        card.isValid();
        return card;
    }

    public Account login(String cardNumber, String pin, HttpSession session)
            throws AccountNotFoundException, CardBlockedException, CardExpiredException, InvalidPinException {
        if (cardNumber == null || cardNumber.trim().isEmpty()) {
            throw new AccountNotFoundException("Card number must not be empty.");
        }
        Account account;
        if (persistenceService != null) {
            account = persistenceService.login(cardNumber.trim(), pin);
            ATMCard memCard = bank.findCardByNumber(cardNumber.trim());
            if (memCard != null) {
                memCard.verifyPin(pin);
            }
        } else {
            ATMCard card = checkCard(cardNumber);
            card.verifyPin(pin);
            account = bank.getAccountForCard(card);
        }

        session.setAttribute(SESSION_CARD_NUMBER, cardNumber.trim());
        session.setAttribute(SESSION_ACCOUNT_NUMBER, account.getAccountNumber());
        return account;
    }

    public Account getAuthenticatedAccount(HttpSession session) throws AccountNotFoundException {
        String accountNumber = (String) session.getAttribute(SESSION_ACCOUNT_NUMBER);
        if (accountNumber == null) {
            throw new IllegalStateException("No active ATM session found. Please insert your card and log in.");
        }
        if (persistenceService != null) {
            return persistenceService.getAccountByNumber(accountNumber);
        }
        return bank.findAccountByNumber(accountNumber);
    }

    public ATMCard getAuthenticatedCard(HttpSession session) throws AccountNotFoundException {
        String cardNumber = (String) session.getAttribute(SESSION_CARD_NUMBER);
        if (cardNumber == null) {
            throw new IllegalStateException("No active ATM session found. Please insert your card and log in.");
        }
        return bank.findCardByNumber(cardNumber);
    }

    public void logout(HttpSession session) {
        if (session != null) {
            session.invalidate();
        }
    }

    public TransactionRecord deposit(BigDecimal amount, HttpSession session)
            throws AccountNotFoundException, InvalidAmountException {
        Account account = getAuthenticatedAccount(session);
        if (persistenceService != null) {
            TransactionRecord record = persistenceService.deposit(account.getAccountNumber(), amount);
            Account memAccount = bank.findAccountByNumber(account.getAccountNumber());
            if (memAccount != null) {
                synchronized (memAccount) {
                    memAccount.deposit(amount);
                }
            }
            return record;
        } else {
            synchronized (account) {
                account.deposit(amount);
                List<TransactionRecord> history = account.getTransactionHistory();
                return history.get(history.size() - 1);
            }
        }
    }

    public TransactionRecord withdraw(BigDecimal amount, HttpSession session)
            throws AccountNotFoundException, InvalidAmountException, InsufficientFundsException {
        return withdrawWithBreakdown(amount, session).getRecord();
    }

    public AtmPersistenceService.WithdrawalResult withdrawWithBreakdown(BigDecimal amount, HttpSession session)
            throws AccountNotFoundException, InvalidAmountException, InsufficientFundsException {
        Account account = getAuthenticatedAccount(session);
        if (persistenceService != null) {
            AtmPersistenceService.WithdrawalResult result =
                    persistenceService.withdraw(account.getAccountNumber(), amount);
            Account memAccount = bank.findAccountByNumber(account.getAccountNumber());
            if (memAccount != null) {
                synchronized (memAccount) {
                    memAccount.withdraw(amount);
                }
            }
            return result;
        } else {
            synchronized (account) {
                account.withdraw(amount);
                List<TransactionRecord> history = account.getTransactionHistory();
                TransactionRecord record = history.get(history.size() - 1);
                return new AtmPersistenceService.WithdrawalResult(record, null, record.getTransactionId());
            }
        }
    }

    public TransactionRecord transfer(String recipientAccountNumber, BigDecimal amount, HttpSession session)
            throws AccountNotFoundException, InvalidAmountException, InsufficientFundsException {
        Account sender = getAuthenticatedAccount(session);
        if (persistenceService != null) {
            TransactionRecord record =
                    persistenceService.transfer(sender.getAccountNumber(), recipientAccountNumber, amount);
            Account memSender = bank.findAccountByNumber(sender.getAccountNumber());
            Account memReceiver = bank.findAccountByNumber(recipientAccountNumber);
            if (memSender != null && memReceiver != null) {
                Account firstLock = memSender.getAccountNumber().compareTo(memReceiver.getAccountNumber()) < 0 ? memSender : memReceiver;
                Account secondLock = firstLock == memSender ? memReceiver : memSender;
                synchronized (firstLock) {
                    synchronized (secondLock) {
                        memSender.transfer(memReceiver, amount);
                    }
                }
            }
            return record;
        } else {
            Account receiver = bank.findAccountByNumber(recipientAccountNumber);
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
    }

    public void changePin(String oldPin, String newPin, String confirmPin, HttpSession session)
            throws AccountNotFoundException, InvalidPinException {
        if (!newPin.equals(confirmPin)) {
            throw new InvalidPinException("New PIN and Confirm PIN do not match.");
        }
        String cardNumber = (String) session.getAttribute(SESSION_CARD_NUMBER);
        if (cardNumber == null) {
            throw new IllegalStateException("No active ATM session found.");
        }

        if (persistenceService != null) {
            persistenceService.changePin(cardNumber, oldPin, newPin, confirmPin);
            ATMCard memCard = bank.findCardByNumber(cardNumber);
            if (memCard != null) {
                memCard.changePin(oldPin, newPin);
            }
        } else {
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
    }

    public List<TransactionRecord> getRecentTransactions(HttpSession session, int limit)
            throws AccountNotFoundException {
        Account account = getAuthenticatedAccount(session);
        if (persistenceService != null) {
            return persistenceService.getRecentTransactions(account.getAccountNumber(), limit);
        }
        return transactionHistory.getLastTransactions(account, limit);
    }

    public void unblockCard(String cardNumber) throws AccountNotFoundException {
        if (persistenceService != null) {
            persistenceService.unblockCard(cardNumber);
        }
        try {
            ATMCard memCard = bank.findCardByNumber(cardNumber);
            if (memCard != null) {
                memCard.unblock();
            }
        } catch (AccountNotFoundException ignored) {
            // Secondary in-memory bank cache synchronization is best-effort
        }
    }

    public static String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) {
            return "****";
        }
        String lastFour = cardNumber.substring(cardNumber.length() - 4);
        return "**** **** " + lastFour;
    }
}
