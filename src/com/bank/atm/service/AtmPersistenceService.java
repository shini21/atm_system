package com.bank.atm.service;

import com.bank.atm.entity.AccountEntity;
import com.bank.atm.entity.CardEntity;
import com.bank.atm.entity.TransactionEntity;
import com.bank.atm.repository.AccountRepository;
import com.bank.atm.repository.CardRepository;
import com.bank.atm.repository.TransactionRepository;
import com.bank.atm.security.PinSecurityService;
import exceptions.AccountNotFoundException;
import exceptions.CardBlockedException;
import exceptions.CardExpiredException;
import exceptions.InsufficientFundsException;
import exceptions.InvalidAmountException;
import exceptions.InvalidPinException;
import model.Account;
import model.CurrentAccount;
import model.Customer;
import model.SavingsAccount;
import model.TransactionRecord;
import model.TransactionType;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class AtmPersistenceService {

    private static final AtomicLong TXN_COUNTER = new AtomicLong(1000);

    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final TransactionRepository transactionRepository;
    private final PinSecurityService pinSecurityService;
    private final CashDispenserService cashDispenserService;

    public AtmPersistenceService(AccountRepository accountRepository,
                                 CardRepository cardRepository,
                                 TransactionRepository transactionRepository,
                                 PinSecurityService pinSecurityService,
                                 CashDispenserService cashDispenserService) {
        this.accountRepository = accountRepository;
        this.cardRepository = cardRepository;
        this.transactionRepository = transactionRepository;
        this.pinSecurityService = pinSecurityService;
        this.cashDispenserService = cashDispenserService;
    }

    public CardEntity checkCard(String cardNumber)
            throws AccountNotFoundException, CardBlockedException, CardExpiredException {
        if (cardNumber == null || cardNumber.trim().isEmpty()) {
            throw new AccountNotFoundException("Card number must not be empty.");
        }
        CardEntity card = cardRepository.findByCardNumberIgnoreCase(cardNumber.trim())
                .orElseThrow(() -> new AccountNotFoundException("Card " + cardNumber.trim() + " not found."));

        if (card.isBlocked()) {
            throw new CardBlockedException("Card " + card.getCardNumber() + " is blocked. Please contact your bank.");
        }
        if (card.getExpiryDate().isBefore(LocalDate.now())) {
            throw new CardExpiredException("Card " + card.getCardNumber() + " expired on " + card.getExpiryDate() + ".");
        }
        return card;
    }

    public Account login(String cardNumber, String rawPin)
            throws AccountNotFoundException, CardBlockedException, CardExpiredException, InvalidPinException {
        CardEntity card = checkCard(cardNumber);

        boolean pinValid = pinSecurityService.matches(rawPin, card.getPinHash());
        if (!pinValid) {
            int attempts = card.getFailedAttempts() + 1;
            card.setFailedAttempts(attempts);
            if (attempts >= 3) {
                card.setBlocked(true);
                cardRepository.save(card);
                throw new InvalidPinException("Incorrect PIN. Card has been blocked after 3 failed attempts.");
            }
            cardRepository.save(card);
            int remaining = 3 - attempts;
            throw new InvalidPinException("Incorrect PIN. " + remaining + " attempt(s) remaining.");
        }

        // Reset failed attempts on successful login
        if (card.getFailedAttempts() > 0) {
            card.setFailedAttempts(0);
            cardRepository.save(card);
        }

        return getAccountByNumber(card.getLinkedAccountNumber());
    }

    public Account getAccountByNumber(String accountNumber) throws AccountNotFoundException {
        AccountEntity entity = accountRepository.findByAccountNumberIgnoreCase(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account " + accountNumber + " not found."));
        return mapToDomainAccount(entity);
    }

    public CardEntity getCardByNumber(String cardNumber) throws AccountNotFoundException {
        return cardRepository.findByCardNumberIgnoreCase(cardNumber)
                .orElseThrow(() -> new AccountNotFoundException("Card " + cardNumber + " not found."));
    }

    @Transactional
    public TransactionRecord deposit(String accountNumber, BigDecimal amount)
            throws AccountNotFoundException, InvalidAmountException {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0 || amount.stripTrailingZeros().scale() > 2) {
            throw new InvalidAmountException("Deposit amount must be positive with at most 2 decimal places.");
        }

        AccountEntity entity = accountRepository.findByAccountNumberIgnoreCase(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account " + accountNumber + " not found."));

        BigDecimal newBalance = entity.getBalance().add(amount);
        entity.setBalance(newBalance);
        accountRepository.save(entity);

        cashDispenserService.acceptDeposit(amount);

        String txnId = generateTxnId();
        TransactionEntity txnEntity = new TransactionEntity(
                txnId, accountNumber, LocalDateTime.now(),
                TransactionType.DEPOSIT.name(), "CREDIT",
                amount, newBalance, "Cash Deposit", null, null
        );
        transactionRepository.save(txnEntity);

        return TransactionRecord.create(TransactionType.DEPOSIT, amount, "Cash Deposit", newBalance);
    }

    @Transactional
    public WithdrawalResult withdraw(String accountNumber, BigDecimal amount)
            throws AccountNotFoundException, InvalidAmountException, InsufficientFundsException {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidAmountException("Withdrawal amount must be greater than zero.");
        }

        AccountEntity entity = accountRepository.findByAccountNumberIgnoreCase(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account " + accountNumber + " not found."));

        BigDecimal minimumBalance = entity.getMinimumBalance();
        BigDecimal newBalance = entity.getBalance().subtract(amount);
        if (newBalance.compareTo(minimumBalance) < 0) {
            throw new InsufficientFundsException("Insufficient funds. Account must maintain a minimum balance of INR "
                    + minimumBalance + ".");
        }

        // Calculate note breakdown from available inventory
        Map<Integer, Integer> breakdown = cashDispenserService.calculateBreakdown(amount);
        cashDispenserService.dispenseCash(breakdown);

        entity.setBalance(newBalance);
        accountRepository.save(entity);

        String txnId = generateTxnId();
        String breakdownStr = breakdown.toString();
        TransactionEntity txnEntity = new TransactionEntity(
                txnId, accountNumber, LocalDateTime.now(),
                TransactionType.WITHDRAWAL.name(), "DEBIT",
                amount, newBalance, "Cash Withdrawal", null, breakdownStr
        );
        transactionRepository.save(txnEntity);

        TransactionRecord record = TransactionRecord.create(TransactionType.WITHDRAWAL, amount, "Cash Withdrawal", newBalance);
        return new WithdrawalResult(record, breakdown, txnId);
    }

    @Transactional
    public TransactionRecord transfer(String senderAccountNumber, String recipientAccountNumber, BigDecimal amount)
            throws AccountNotFoundException, InvalidAmountException, InsufficientFundsException {
        if (senderAccountNumber.equalsIgnoreCase(recipientAccountNumber)) {
            throw new InvalidAmountException("Cannot transfer funds to the same account.");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0 || amount.stripTrailingZeros().scale() > 2) {
            throw new InvalidAmountException("Transfer amount must be positive with at most 2 decimal places.");
        }

        AccountEntity sender = accountRepository.findByAccountNumberIgnoreCase(senderAccountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Sender account " + senderAccountNumber + " not found."));
        AccountEntity receiver = accountRepository.findByAccountNumberIgnoreCase(recipientAccountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Beneficiary account " + recipientAccountNumber + " not found."));

        BigDecimal senderNewBalance = sender.getBalance().subtract(amount);
        if (senderNewBalance.compareTo(sender.getMinimumBalance()) < 0) {
            throw new InsufficientFundsException("Insufficient funds. Transfer would violate minimum balance of INR "
                    + sender.getMinimumBalance() + ".");
        }

        sender.setBalance(senderNewBalance);
        receiver.setBalance(receiver.getBalance().add(amount));

        accountRepository.save(sender);
        accountRepository.save(receiver);

        String txnId = generateTxnId();
        TransactionEntity senderTxn = new TransactionEntity(
                txnId, senderAccountNumber, LocalDateTime.now(),
                TransactionType.TRANSFER_OUT.name(), "DEBIT",
                amount, senderNewBalance, "Transfer to " + recipientAccountNumber, null, null
        );
        transactionRepository.save(senderTxn);

        TransactionEntity receiverTxn = new TransactionEntity(
                generateTxnId(), recipientAccountNumber, LocalDateTime.now(),
                TransactionType.TRANSFER_IN.name(), "CREDIT",
                amount, receiver.getBalance(), "Transfer from " + senderAccountNumber, null, null
        );
        transactionRepository.save(receiverTxn);

        return TransactionRecord.create(TransactionType.TRANSFER_OUT, amount, "Transfer to " + recipientAccountNumber, senderNewBalance);
    }

    @Transactional
    public void changePin(String cardNumber, String oldPin, String newPin, String confirmPin)
            throws AccountNotFoundException, InvalidPinException {
        if (!newPin.equals(confirmPin)) {
            throw new InvalidPinException("New PIN and Confirm PIN do not match.");
        }
        if (!newPin.matches("^\\d{4}$")) {
            throw new InvalidPinException("New PIN must be exactly 4 digits.");
        }

        CardEntity card = cardRepository.findByCardNumberIgnoreCase(cardNumber)
                .orElseThrow(() -> new AccountNotFoundException("Card " + cardNumber + " not found."));

        if (!pinSecurityService.matches(oldPin, card.getPinHash())) {
            throw new InvalidPinException("Incorrect current PIN.");
        }

        card.setPinHash(pinSecurityService.hashPin(newPin));
        cardRepository.save(card);

        AccountEntity account = accountRepository.findByAccountNumberIgnoreCase(card.getLinkedAccountNumber())
                .orElse(null);
        if (account != null) {
            transactionRepository.save(new TransactionEntity(
                    generateTxnId(), account.getAccountNumber(), LocalDateTime.now(),
                    TransactionType.PIN_CHANGE.name(), "NONE",
                    BigDecimal.ZERO, account.getBalance(), "PIN changed via ATM", null, null
            ));
        }
    }

    public List<TransactionRecord> getRecentTransactions(String accountNumber, int limit) {
        List<TransactionEntity> entities = transactionRepository.findByAccountNumberOrderByTimestampDesc(
                accountNumber, PageRequest.of(0, Math.min(limit, 50))
        );
        List<TransactionRecord> records = new ArrayList<>();
        for (TransactionEntity e : entities) {
            TransactionType type = TransactionType.valueOf(e.getType());
            records.add(TransactionRecord.create(type, e.getAmount(), e.getRemarks(), e.getBalanceAfter()));
        }
        return records;
    }

    public TransactionEntity getTransactionByReference(String transactionId) {
        return transactionRepository.findByTransactionId(transactionId).orElse(null);
    }

    @Transactional
    public void unblockCard(String cardNumber) throws AccountNotFoundException {
        CardEntity card = cardRepository.findByCardNumberIgnoreCase(cardNumber)
                .orElseThrow(() -> new AccountNotFoundException("Card " + cardNumber + " not found."));
        card.setBlocked(false);
        card.setFailedAttempts(0);
        cardRepository.save(card);
    }

    private String generateTxnId() {
        return "TXN-" + TXN_COUNTER.incrementAndGet();
    }

    private Account mapToDomainAccount(AccountEntity entity) {
        Customer c = new Customer(
                entity.getCustomer().getCustomerId(),
                entity.getCustomer().getFullName(),
                entity.getCustomer().getPhoneNumber(),
                entity.getCustomer().getEmail()
        );
        if ("Current Account".equalsIgnoreCase(entity.getAccountType())) {
            return new CurrentAccount(entity.getAccountNumber(), c, entity.getBalance());
        }
        return new SavingsAccount(entity.getAccountNumber(), c, entity.getBalance());
    }

    public static class WithdrawalResult {
        private final TransactionRecord record;
        private final Map<Integer, Integer> breakdown;
        private final String transactionId;

        public WithdrawalResult(TransactionRecord record, Map<Integer, Integer> breakdown, String transactionId) {
            this.record = record;
            this.breakdown = breakdown;
            this.transactionId = transactionId;
        }

        public TransactionRecord getRecord() {
            return record;
        }

        public Map<Integer, Integer> getBreakdown() {
            return breakdown;
        }

        public String getTransactionId() {
            return transactionId;
        }
    }
}

