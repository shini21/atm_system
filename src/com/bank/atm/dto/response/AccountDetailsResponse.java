package com.bank.atm.dto.response;

import java.math.BigDecimal;

/**
 * Details of the authenticated customer account.
 */
public class AccountDetailsResponse {

    private String customerId;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String accountNumber;
    private String maskedCardNumber;
    private String accountType;
    private BigDecimal balance;
    private BigDecimal availableBalance;
    private BigDecimal minimumBalance;

    public AccountDetailsResponse() {
    }

    public AccountDetailsResponse(String customerId, String fullName, String phoneNumber,
                                  String email, String accountNumber, String maskedCardNumber,
                                  String accountType, BigDecimal balance,
                                  BigDecimal availableBalance, BigDecimal minimumBalance) {
        this.customerId = customerId;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.accountNumber = accountNumber;
        this.maskedCardNumber = maskedCardNumber;
        this.accountType = accountType;
        this.balance = balance;
        this.availableBalance = availableBalance;
        this.minimumBalance = minimumBalance;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getMaskedCardNumber() {
        return maskedCardNumber;
    }

    public void setMaskedCardNumber(String maskedCardNumber) {
        this.maskedCardNumber = maskedCardNumber;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public BigDecimal getAvailableBalance() {
        return availableBalance;
    }

    public void setAvailableBalance(BigDecimal availableBalance) {
        this.availableBalance = availableBalance;
    }

    public BigDecimal getMinimumBalance() {
        return minimumBalance;
    }

    public void setMinimumBalance(BigDecimal minimumBalance) {
        this.minimumBalance = minimumBalance;
    }
}

