package service;

import exceptions.AccountNotFoundException;
import exceptions.CardBlockedException;
import exceptions.CardExpiredException;
import exceptions.InsufficientFundsException;
import exceptions.InvalidAmountException;
import exceptions.InvalidMenuChoiceException;
import exceptions.InvalidPinException;
import model.ATMCard;
import model.Account;
import model.TransactionRecord;
import model.TransactionType;
import util.InputValidator;

import java.math.BigDecimal;
import java.util.Scanner;

/**
 * Controls the console ATM: card selection, PIN login, the main menu, and each operation.
 *
 * <p>Session flow:
 * <pre>
 * select card -> validate card -> PIN login -> load linked account
 *      -> menu loop (operations) -> eject card / reset session -> next card
 * </pre>
 *
 * <p>This class only uses public methods of {@link Account}, {@link ATMCard} and
 * {@link Bank}; it never edits their private state. Every expected user mistake
 * (bad menu choice, bad amount, wrong PIN, unknown account, ...) is caught and
 * shown as a short message, never as a stack trace. If the input stream ends,
 * the ATM shuts down cleanly.
 *
 * <p><b>Simulation note:</b> the PIN is echoed as typed. Console masking is not
 * supported reliably across IDEs, so it is not attempted.
 */
public class ATM {

    private static final int MENU_MIN = 1;
    private static final int MENU_MAX = 7;
    private static final String LINE = "====================================";

    private final Bank bank;
    private final Scanner scanner;
    private final TransactionHistory transactionHistory = new TransactionHistory();

    private ATMCard insertedCard;
    private Account activeAccount;
    private boolean authenticated;
    private boolean shutdownRequested;

    /**
     * @param bank    the bank holding the accounts and cards
     * @param scanner the source of user input, normally {@code new Scanner(System.in)}
     * @throws IllegalArgumentException if either argument is null
     */
    public ATM(Bank bank, Scanner scanner) {
        if (bank == null || scanner == null) {
            throw new IllegalArgumentException("Bank and scanner must not be null.");
        }
        this.bank = bank;
        this.scanner = scanner;
    }

    /**
     * Runs the ATM until the user types EXIT at the card prompt or the input ends.
     */
    public void start() {
        shutdownRequested = false;
        printWelcome();
        try {
            while (!shutdownRequested) {
                selectCard();
                if (insertedCard != null) {
                    if (authenticateUser()) {
                        runSession();
                    } else {
                        System.out.println("Session ended.");
                    }
                    resetSession();
                }
            }
            System.out.println();
            System.out.println("Thank you for using Java ATM. Goodbye!");
        } catch (InputClosedException e) {
            System.out.println();
            System.out.println("Input closed. ATM shutting down.");
        } finally {
            resetSession();
        }
    }

    // ---------------------------------------------------------------------
    // Card selection and authentication
    // ---------------------------------------------------------------------

    /**
     * Asks for a card number, looks it up, and checks it is neither blocked nor expired.
     * On success {@code insertedCard} is set; otherwise it stays null.
     * Typing EXIT requests shutdown.
     */
    private void selectCard() {
        System.out.println();
        System.out.println("Available demo card numbers: "
                + String.join(", ", bank.getCardNumbers()));
        String input = readLine("Enter card number (or EXIT to shut down): ");

        if (input.equalsIgnoreCase("EXIT")) {
            shutdownRequested = true;
            return;
        }
        try {
            ATMCard card = bank.findCardByNumber(input);
            card.isValid();
            insertedCard = card;
            System.out.println("Card " + card.getCardNumber() + " accepted.");
        } catch (AccountNotFoundException | CardBlockedException | CardExpiredException e) {
            System.out.println(e.getMessage());
            insertedCard = null;
        }
    }

    /**
     * Asks for the PIN until it is correct or the card becomes blocked.
     * Every failed attempt is counted by the card, so this loop ends after at most
     * three tries.
     *
     * @return {@code true} if the user logged in and the linked account was loaded
     */
    private boolean authenticateUser() {
        while (true) {
            String pin = readLine("Enter 4-digit PIN: ");
            try {
                insertedCard.verifyPin(pin);
                activeAccount = bank.getAccountForCard(insertedCard);
                authenticated = true;
                System.out.println();
                System.out.println("Login successful. Welcome, "
                        + activeAccount.getOwner().getFullName() + "!");
                return true;
            } catch (InvalidPinException e) {
                System.out.println(e.getMessage());
                if (insertedCard.isBlocked()) {
                    return false;
                }
            } catch (AccountNotFoundException e) {
                System.out.println(e.getMessage());
                return false;
            }
        }
    }

    // ---------------------------------------------------------------------
    // Menu
    // ---------------------------------------------------------------------

    /**
     * Shows the menu and handles choices until the session ends.
     */
    private void runSession() {
        while (authenticated) {
            showMainMenu();
            String input = readLine("Enter your choice: ");
            try {
                processMenuChoice(InputValidator.parseMenuChoice(input, MENU_MIN, MENU_MAX));
            } catch (InvalidMenuChoiceException e) {
                System.out.println("Invalid choice: " + e.getMessage());
            }
        }
    }

    private void showMainMenu() {
        System.out.println();
        System.out.println(LINE);
        System.out.println("             ATM MENU");
        System.out.println(LINE);
        System.out.println("1. Check Balance");
        System.out.println("2. Deposit Money");
        System.out.println("3. Withdraw Money");
        System.out.println("4. Transfer Money");
        System.out.println("5. View Last 5 Transactions");
        System.out.println("6. Change PIN");
        System.out.println("7. Eject Card / Exit");
        System.out.println(LINE);
    }

    private void processMenuChoice(int choice) {
        switch (choice) {
            case 1:
                handleBalanceInquiry();
                break;
            case 2:
                handleDeposit();
                break;
            case 3:
                handleWithdrawal();
                break;
            case 4:
                handleTransfer();
                break;
            case 5:
                handleTransactionHistory();
                break;
            case 6:
                handlePinChange();
                break;
            case 7:
                ejectCard();
                break;
            default:
                // parseMenuChoice already rejects anything outside 1-7; this is a safety net.
                System.out.println("Invalid choice: Please choose a number between "
                        + MENU_MIN + " and " + MENU_MAX + ".");
        }
    }

    // ---------------------------------------------------------------------
    // Operations
    // ---------------------------------------------------------------------

    private void handleBalanceInquiry() {
        System.out.println("Account         : " + activeAccount);
        System.out.println("Current balance : " + activeAccount.getBalance().toPlainString());
        System.out.println("Available to withdraw: "
                + activeAccount.getAvailableBalance().toPlainString());
    }

    private void handleDeposit() {
        String input = readLine("Enter deposit amount: ");
        try {
            BigDecimal amount = InputValidator.parsePositiveAmount(input);
            activeAccount.deposit(amount);
            System.out.println("Deposit successful. Current balance: "
                    + activeAccount.getBalance().toPlainString());
        } catch (InvalidAmountException e) {
            System.out.println("Deposit failed: " + e.getMessage());
        }
    }

    private void handleWithdrawal() {
        String input = readLine("Enter withdrawal amount: ");
        try {
            BigDecimal amount = InputValidator.parsePositiveAmount(input);
            activeAccount.withdraw(amount);
            System.out.println("Withdrawal successful. Current balance: "
                    + activeAccount.getBalance().toPlainString());
        } catch (InvalidAmountException | InsufficientFundsException e) {
            System.out.println("Withdrawal failed: " + e.getMessage());
        }
    }

    private void handleTransfer() {
        String receiverNumber = readLine("Enter receiver account number: ");
        try {
            Account receiver = bank.findAccountByNumber(receiverNumber);
            if (receiver == activeAccount) {
                System.out.println("Transfer failed: You cannot transfer money to your own account.");
                return;
            }
            String input = readLine("Enter transfer amount: ");
            BigDecimal amount = InputValidator.parsePositiveAmount(input);
            activeAccount.transfer(receiver, amount);
            System.out.println("Transfer successful. Sent " + amount.toPlainString() + " to "
                    + receiver.getAccountNumber() + ". Current balance: "
                    + activeAccount.getBalance().toPlainString());
        } catch (AccountNotFoundException | InvalidAmountException
                 | InsufficientFundsException e) {
            System.out.println("Transfer failed: " + e.getMessage());
        }
    }

    private void handleTransactionHistory() {
        transactionHistory.showLastTransactions(activeAccount);
    }

    /**
     * Changes the PIN. The new PIN's format is checked first so a typo does not use up a
     * login attempt. The old PIN is then verified by the card, so a wrong old PIN counts
     * as a failed attempt and can block the card, which ends the session.
     */
    private void handlePinChange() {
        String oldPin = readLine("Enter current PIN: ");
        String newPin = readLine("Enter new 4-digit PIN: ");

        if (!InputValidator.isValidPinFormat(newPin)) {
            System.out.println("PIN change failed: New PIN must be exactly 4 digits.");
            return;
        }
        try {
            insertedCard.changePin(oldPin, newPin);
            activeAccount.addTransaction(TransactionRecord.create(TransactionType.PIN_CHANGE,
                    BigDecimal.ZERO, "PIN changed", activeAccount.getBalance()));
            System.out.println("PIN changed successfully.");
        } catch (InvalidPinException e) {
            System.out.println("PIN change failed: " + e.getMessage());
            if (insertedCard.isBlocked()) {
                System.out.println("Card has been blocked. Session ended.");
                resetSession();
            }
        }
    }

    // ---------------------------------------------------------------------
    // Session control
    // ---------------------------------------------------------------------

    private void ejectCard() {
        System.out.println("Card ejected. Thank you for using Java ATM.");
        resetSession();
    }

    /**
     * Forgets the current card and account so nothing carries over to the next customer.
     */
    private void resetSession() {
        insertedCard = null;
        activeAccount = null;
        authenticated = false;
    }

    // ---------------------------------------------------------------------
    // Input helpers
    // ---------------------------------------------------------------------

    private void printWelcome() {
        System.out.println(LINE);
        System.out.println("     WELCOME TO JAVA ATM SYSTEM");
        System.out.println(LINE);
    }

    /**
     * Prints a prompt and reads one trimmed line.
     *
     * @throws InputClosedException if the input has ended
     */
    private String readLine(String prompt) {
        System.out.print(prompt);
        System.out.flush();
        if (!scanner.hasNextLine()) {
            throw new InputClosedException();
        }
        return scanner.nextLine().trim();
    }

    /**
     * Signals that the input stream ended (for example Ctrl+D, or piped input ran out).
     * Unchecked and private on purpose: it only travels from {@link #readLine} to
     * {@link #start()}, which turns it into a clean shutdown.
     */
    private static final class InputClosedException extends RuntimeException {
        private static final long serialVersionUID = 1L;
    }
}
