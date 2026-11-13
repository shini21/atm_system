package com.bank.atm;


import com.bank.atm.model.*;
import com.bank.atm.service.*;
import com.bank.atm.interfaces.*;
import com.bank.atm.enums.*;
import com.bank.atm.exceptions.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Scanner;

/**
 * Entry point of the ATM Simulation System.
 *
 * <p>It only builds the demo data and starts the ATM; all business logic lives in the
 * {@code model} and {@code service} packages.
 *
 * <p><b>Demo credentials</b> (classroom use only; real systems must never store or show
 * PINs in plain text):
 * <pre>
 * CARD1001  PIN 1234  Aarav Sharma  ACC1001  Savings  5000.00  expires 2028-12-31
 * CARD1002  PIN 5678  Priya Patel   ACC1002  Current 12000.00  expires 2028-06-30
 * CARD1003  PIN 4321  Rahul Verma   ACC1003  Savings   800.00  expired 2025-01-01 (expired-card test)
 * CARD1004  PIN 9999  Neha Iyer     ACC1004  Savings  1500.00  pre-blocked (blocked-card test)
 * </pre>
 * All phone numbers and email addresses are made-up placeholders.
 */
public class Main {

    public static void main(String[] args) {
        Bank bank = new Bank();
        registerSampleData(bank);

        try (Scanner scanner = new Scanner(System.in)) {
            ATM atm = new ATM(bank, scanner);
            atm.start();
        }
    }

    /**
     * Creates the demo customers, accounts and cards, and registers them with the bank.
     */
    private static void registerSampleData(Bank bank) {
        // Customers
        Customer aarav = new Customer("CUST001", "Aarav Sharma", "9000000001",
                "aarav.sharma@example.com");
        Customer priya = new Customer("CUST002", "Priya Patel", "9000000002",
                "priya.patel@example.com");
        Customer rahul = new Customer("CUST003", "Rahul Verma", "9000000003",
                "rahul.verma@example.com");
        Customer neha = new Customer("CUST004", "Neha Iyer", "9000000004",
                "neha.iyer@example.com");

        // Accounts: held through Account references to show polymorphism
        Account aaravSavings = new SavingsAccount("ACC1001", aarav, new BigDecimal("5000.00"));
        Account priyaCurrent = new CurrentAccount("ACC1002", priya, new BigDecimal("12000.00"));
        Account rahulSavings = new SavingsAccount("ACC1003", rahul, new BigDecimal("800.00"));
        Account nehaSavings = new SavingsAccount("ACC1004", neha, new BigDecimal("1500.00"));

        // Cards
        ATMCard card1 = new ATMCard("CARD1001", "1234", LocalDate.of(2028, 12, 31), "ACC1001");
        ATMCard card2 = new ATMCard("CARD1002", "5678", LocalDate.of(2028, 6, 30), "ACC1002");
        ATMCard expiredCard = new ATMCard("CARD1003", "4321", LocalDate.of(2025, 1, 1), "ACC1003");
        ATMCard blockedCard = new ATMCard("CARD1004", "9999", LocalDate.of(2028, 12, 31), "ACC1004");
        blockedCard.block();

        // Register everything with the bank
        bank.addAccount(aaravSavings);
        bank.addAccount(priyaCurrent);
        bank.addAccount(rahulSavings);
        bank.addAccount(nehaSavings);

        bank.addCard(card1);
        bank.addCard(card2);
        bank.addCard(expiredCard);
        bank.addCard(blockedCard);
    }
}
