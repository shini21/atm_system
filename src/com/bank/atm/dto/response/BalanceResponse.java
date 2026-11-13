package com.bank.atm.dto.response;

import java.math.BigDecimal;

/**
 * Balance snapshot for real-time inquiries.
 */
public class BalanceResponse {

    private String accountNumber;
    private String accountType;
    private BigDecimal currentBalance;
    private BigDecimal availableBalance;
    private BigDecimal minimumBalance;

    public BalanceResponse() {
    }

    public BalanceResponse(String accountNumber, String accountType, BigDecimal currentBalance,
                           BigDecimal availableBalance, BigDecimal minimumBalance) {
        this.accountNumber = accountNumber;
        this.accountType = accountType;
        this.currentBalance = currentBalance;
        this.availableBalance = availableBalance;
        this.minimumBalance = minimumBalance;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(BigDecimal currentBalance) {
        this.currentBalance = currentBalance;
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

