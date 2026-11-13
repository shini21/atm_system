package com.bank.atm.config;

import model.ATMCard;
import model.Account;
import model.CurrentAccount;
import model.Customer;
import model.SavingsAccount;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import service.Bank;
import service.TransactionHistory;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Spring configuration providing singleton instances of {@link Bank} and {@link TransactionHistory}.
 * Initializes the bank with the demo dataset to ensure consistency across web requests.
 */
@Configuration
public class BankConfig {

    @Bean
    public Bank bank() {
        Bank bank = new Bank();
        initializeSampleData(bank);
        return bank;
    }

    @Bean
    public TransactionHistory transactionHistory() {
        return new TransactionHistory();
    }

    /**
     * Initializes identical sample data as the console entrypoint.
     */
    private void initializeSampleData(Bank bank) {
        // Customers
        Customer aarav = new Customer("CUST001", "Aarav Sharma", "9000000001", "aarav.sharma@example.com");
        Customer priya = new Customer("CUST002", "Priya Patel", "9000000002", "priya.patel@example.com");
        Customer rahul = new Customer("CUST003", "Rahul Verma", "9000000003", "rahul.verma@example.com");
        Customer neha = new Customer("CUST004", "Neha Iyer", "9000000004", "neha.iyer@example.com");
        Customer vikram = new Customer("CUST005", "Vikram Malhotra", "9000000005", "vikram.malhotra@example.com");

        // Accounts
        Account aaravSavings = new SavingsAccount("ACC1001", aarav, new BigDecimal("5000.00"));
        Account priyaCurrent = new CurrentAccount("ACC1002", priya, new BigDecimal("12000.00"));
        Account rahulSavings = new SavingsAccount("ACC1003", rahul, new BigDecimal("800.00"));
        Account nehaSavings = new SavingsAccount("ACC1004", neha, new BigDecimal("1500.00"));
        Account vikramSavings = new SavingsAccount("ACC1005", vikram, new BigDecimal("150.00"));

        // Cards
        ATMCard card1 = new ATMCard("CARD1001", "1234", LocalDate.of(2028, 12, 31), "ACC1001");
        ATMCard card2 = new ATMCard("CARD1002", "5678", LocalDate.of(2028, 6, 30), "ACC1002");
        ATMCard expiredCard = new ATMCard("CARD1003", "4321", LocalDate.of(2025, 1, 1), "ACC1003");
        ATMCard blockedCard = new ATMCard("CARD1004", "9999", LocalDate.of(2028, 12, 31), "ACC1004");
        blockedCard.block();
        ATMCard card5 = new ATMCard("CARD1005", "2468", LocalDate.of(2028, 12, 31), "ACC1005");

        // Register accounts
        bank.addAccount(aaravSavings);
        bank.addAccount(priyaCurrent);
        bank.addAccount(rahulSavings);
        bank.addAccount(nehaSavings);
        bank.addAccount(vikramSavings);

        // Register cards
        bank.addCard(card1);
        bank.addCard(card2);
        bank.addCard(expiredCard);
        bank.addCard(blockedCard);
        bank.addCard(card5);
    }
}

