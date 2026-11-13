package com.bank.atm.config;

import com.bank.atm.entity.AccountEntity;
import com.bank.atm.entity.AtmInventoryEntity;
import com.bank.atm.entity.CardEntity;
import com.bank.atm.entity.CustomerEntity;
import com.bank.atm.repository.AccountRepository;
import com.bank.atm.repository.AtmInventoryRepository;
import com.bank.atm.repository.CardRepository;
import com.bank.atm.repository.CustomerRepository;
import com.bank.atm.security.PinSecurityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final AtmInventoryRepository atmInventoryRepository;
    private final PinSecurityService pinSecurityService;

    public DataInitializer(CustomerRepository customerRepository,
                           AccountRepository accountRepository,
                           CardRepository cardRepository,
                           AtmInventoryRepository atmInventoryRepository,
                           PinSecurityService pinSecurityService) {
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.cardRepository = cardRepository;
        this.atmInventoryRepository = atmInventoryRepository;
        this.pinSecurityService = pinSecurityService;
    }

    @Override
    public void run(String... args) {
        if (customerRepository.count() > 0) {
            log.info("Database already contains data; skipping initial seed.");
            return;
        }

        log.info("Seeding initial demo bank accounts, BCrypt cards, and ATM cash inventory...");

        // 1. Customers
        CustomerEntity c1 = new CustomerEntity("CUST001", "Aarav Sharma", "9000000001", "aarav.sharma@example.com");
        CustomerEntity c2 = new CustomerEntity("CUST002", "Priya Patel", "9000000002", "priya.patel@example.com");
        CustomerEntity c3 = new CustomerEntity("CUST003", "Rahul Verma", "9000000003", "rahul.verma@example.com");
        CustomerEntity c4 = new CustomerEntity("CUST004", "Neha Iyer", "9000000004", "neha.iyer@example.com");
        CustomerEntity c5 = new CustomerEntity("CUST005", "Vikram Malhotra", "9000000005", "vikram.malhotra@example.com");

        customerRepository.save(c1);
        customerRepository.save(c2);
        customerRepository.save(c3);
        customerRepository.save(c4);
        customerRepository.save(c5);

        // 2. Accounts
        AccountEntity a1 = new AccountEntity("ACC1001", "Savings Account", new BigDecimal("5000.00"), new BigDecimal("100.00"), c1);
        AccountEntity a2 = new AccountEntity("ACC1002", "Current Account", new BigDecimal("12000.00"), new BigDecimal("0.00"), c2);
        AccountEntity a3 = new AccountEntity("ACC1003", "Savings Account", new BigDecimal("800.00"), new BigDecimal("100.00"), c3);
        AccountEntity a4 = new AccountEntity("ACC1004", "Savings Account", new BigDecimal("1500.00"), new BigDecimal("100.00"), c4);
        AccountEntity a5 = new AccountEntity("ACC1005", "Savings Account", new BigDecimal("150.00"), new BigDecimal("100.00"), c5);

        accountRepository.save(a1);
        accountRepository.save(a2);
        accountRepository.save(a3);
        accountRepository.save(a4);
        accountRepository.save(a5);

        // 3. Cards with BCrypt PIN hashes
        CardEntity card1 = new CardEntity("CARD1001", pinSecurityService.hashPin("1234"), LocalDate.of(2028, 12, 31), 0, false, "ACC1001");
        CardEntity card2 = new CardEntity("CARD1002", pinSecurityService.hashPin("5678"), LocalDate.of(2028, 6, 30), 0, false, "ACC1002");
        CardEntity card3 = new CardEntity("CARD1003", pinSecurityService.hashPin("4321"), LocalDate.of(2025, 1, 1), 0, false, "ACC1003"); // Expired
        CardEntity card4 = new CardEntity("CARD1004", pinSecurityService.hashPin("9999"), LocalDate.of(2028, 12, 31), 3, true, "ACC1004"); // Blocked
        CardEntity card5 = new CardEntity("CARD1005", pinSecurityService.hashPin("2468"), LocalDate.of(2028, 12, 31), 0, false, "ACC1005"); // Low balance

        cardRepository.save(card1);
        cardRepository.save(card2);
        cardRepository.save(card3);
        cardRepository.save(card4);
        cardRepository.save(card5);

        // 4. ATM Cash Inventory (₹500: 40, ₹200: 50, ₹100: 50 -> Total ₹35,000)
        atmInventoryRepository.save(new AtmInventoryEntity(500, 40));
        atmInventoryRepository.save(new AtmInventoryEntity(200, 50));
        atmInventoryRepository.save(new AtmInventoryEntity(100, 50));

        log.info("Database seed completed successfully.");
    }
}

