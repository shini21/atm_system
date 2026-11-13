package com.bank.atm;

import com.bank.atm.config.BankConfig;
import com.bank.atm.service.AtmWebService;
import exceptions.AccountNotFoundException;
import exceptions.CardBlockedException;
import exceptions.CardExpiredException;
import exceptions.InsufficientFundsException;
import exceptions.InvalidAmountException;
import exceptions.InvalidPinException;
import model.ATMCard;
import model.Account;
import model.TransactionRecord;
import model.TransactionType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;
import service.Bank;
import service.TransactionHistory;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests verifying domain logic, validations, and session handling in {@link AtmWebService}.
 */
class AtmWebServiceTest {

    private Bank bank;
    private TransactionHistory transactionHistory;
    private AtmWebService atmWebService;
    private MockHttpSession session;

    @BeforeEach
    void setUp() {
        BankConfig config = new BankConfig();
        bank = config.bank();
        transactionHistory = config.transactionHistory();
        atmWebService = new AtmWebService(bank, transactionHistory);
        session = new MockHttpSession();
    }

    @Test
    @DisplayName("Check card succeeds for active card CARD1001")
    void testCheckCardActive() throws Exception {
        ATMCard card = atmWebService.checkCard("CARD1001");
        assertNotNull(card);
        assertEquals("CARD1001", card.getCardNumber());
        assertFalse(card.isBlocked());
        assertFalse(card.isExpired());
    }

    @Test
    @DisplayName("Check card throws CardExpiredException for expired card CARD1003")
    void testCheckCardExpired() {
        assertThrows(CardExpiredException.class, () -> atmWebService.checkCard("CARD1003"));
    }

    @Test
    @DisplayName("Check card throws CardBlockedException for blocked card CARD1004")
    void testCheckCardBlocked() {
        assertThrows(CardBlockedException.class, () -> atmWebService.checkCard("CARD1004"));
    }

    @Test
    @DisplayName("Check card throws AccountNotFoundException for non-existent card")
    void testCheckCardNotFound() {
        assertThrows(AccountNotFoundException.class, () -> atmWebService.checkCard("CARD9999"));
    }

    @Test
    @DisplayName("Login with correct PIN succeeds and stores session attributes")
    void testLoginSuccess() throws Exception {
        Account account = atmWebService.login("CARD1001", "1234", session);
        assertNotNull(account);
        assertEquals("ACC1001", account.getAccountNumber());
        assertEquals("CARD1001", session.getAttribute(AtmWebService.SESSION_CARD_NUMBER));
        assertEquals("ACC1001", session.getAttribute(AtmWebService.SESSION_ACCOUNT_NUMBER));
    }

    @Test
    @DisplayName("Login with wrong PIN fails and increments failed attempts")
    void testLoginWrongPin() throws Exception {
        ATMCard card = bank.findCardByNumber("CARD1001");
        assertEquals(3, card.getRemainingAttempts());

        assertThrows(InvalidPinException.class, () -> atmWebService.login("CARD1001", "0000", session));
        assertEquals(2, card.getRemainingAttempts());
        assertFalse(card.isBlocked());

        assertThrows(InvalidPinException.class, () -> atmWebService.login("CARD1001", "0000", session));
        assertEquals(1, card.getRemainingAttempts());
        assertFalse(card.isBlocked());

        // 3rd failed attempt blocks the card
        assertThrows(InvalidPinException.class, () -> atmWebService.login("CARD1001", "0000", session));
        assertEquals(0, card.getRemainingAttempts());
        assertTrue(card.isBlocked());
    }

    @Test
    @DisplayName("Deposit increases balance and creates DEPOSIT transaction record")
    void testDeposit() throws Exception {
        atmWebService.login("CARD1001", "1234", session);
        BigDecimal initialBalance = new BigDecimal("5000.00");
        BigDecimal depositAmount = new BigDecimal("1500.50");

        TransactionRecord record = atmWebService.deposit(depositAmount, session);
        assertNotNull(record);
        assertEquals(TransactionType.DEPOSIT, record.getType());
        assertEquals(depositAmount, record.getAmount());
        assertEquals(initialBalance.add(depositAmount), record.getBalanceAfterTransaction());

        Account account = atmWebService.getAuthenticatedAccount(session);
        assertEquals(new BigDecimal("6500.50"), account.getBalance());
    }

    @Test
    @DisplayName("Withdrawal reduces balance and respects minimum balance rule")
    void testWithdrawal() throws Exception {
        atmWebService.login("CARD1001", "1234", session);
        // ACC1001 balance: 5000.00, minimum balance: 100.00, available: 4900.00
        BigDecimal withdrawAmount = new BigDecimal("2000.00");

        TransactionRecord record = atmWebService.withdraw(withdrawAmount, session);
        assertNotNull(record);
        assertEquals(TransactionType.WITHDRAWAL, record.getType());
        assertEquals(new BigDecimal("3000.00"), record.getBalanceAfterTransaction());

        // Try withdrawing more than available (4900 - 2000 = 2900 available, request 2950)
        assertThrows(InsufficientFundsException.class, () ->
                atmWebService.withdraw(new BigDecimal("2950.00"), session));
    }

    @Test
    @DisplayName("Transfer sends money from sender to recipient correctly")
    void testTransfer() throws Exception {
        atmWebService.login("CARD1001", "1234", session);
        // Sender: ACC1001 (5000.00), Receiver: ACC1002 (12000.00)
        BigDecimal transferAmount = new BigDecimal("1000.00");

        TransactionRecord record = atmWebService.transfer("ACC1002", transferAmount, session);
        assertNotNull(record);
        assertEquals(TransactionType.TRANSFER_OUT, record.getType());
        assertEquals(new BigDecimal("4000.00"), record.getBalanceAfterTransaction());

        Account receiver = bank.findAccountByNumber("ACC1002");
        assertEquals(new BigDecimal("13000.00"), receiver.getBalance());
    }

    @Test
    @DisplayName("Transfer to same account is rejected")
    void testTransferToSameAccount() throws Exception {
        atmWebService.login("CARD1001", "1234", session);
        assertThrows(InvalidAmountException.class, () ->
                atmWebService.transfer("ACC1001", new BigDecimal("500.00"), session));
    }

    @Test
    @DisplayName("Change PIN verifies old PIN and updates to new PIN")
    void testChangePin() throws Exception {
        atmWebService.login("CARD1001", "1234", session);

        // Mismatched confirm PIN
        assertThrows(InvalidPinException.class, () ->
                atmWebService.changePin("1234", "9876", "9999", session));

        // Wrong old PIN
        assertThrows(InvalidPinException.class, () ->
                atmWebService.changePin("0000", "9876", "9876", session));

        // Successful change
        atmWebService.changePin("1234", "9876", "9876", session);

        // Test login with new PIN
        ATMCard card = bank.findCardByNumber("CARD1001");
        assertTrue(card.verifyPin("9876"));
    }

    @Test
    @DisplayName("Recent transactions returns latest operations newest first")
    void testRecentTransactions() throws Exception {
        atmWebService.login("CARD1001", "1234", session);
        atmWebService.deposit(new BigDecimal("500.00"), session);
        atmWebService.withdraw(new BigDecimal("200.00"), session);
        atmWebService.transfer("ACC1002", new BigDecimal("300.00"), session);

        List<TransactionRecord> recent = atmWebService.getRecentTransactions(session, 5);
        assertEquals(3, recent.size());
        assertEquals(TransactionType.TRANSFER_OUT, recent.get(0).getType());
        assertEquals(TransactionType.WITHDRAWAL, recent.get(1).getType());
        assertEquals(TransactionType.DEPOSIT, recent.get(2).getType());
    }

    @Test
    @DisplayName("Logout invalidates session")
    void testLogout() throws Exception {
        atmWebService.login("CARD1001", "1234", session);
        assertNotNull(session.getAttribute(AtmWebService.SESSION_CARD_NUMBER));

        atmWebService.logout(session);
        assertTrue(session.isInvalid());
    }
}

