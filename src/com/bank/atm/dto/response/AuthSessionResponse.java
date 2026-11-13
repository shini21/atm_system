package com.bank.atm.dto.response;

import java.time.LocalDate;

/**
 * Session verification response.
 */
public class AuthSessionResponse {

    private boolean authenticated;
    private String cardNumber;
    private String maskedCardNumber;
    private String accountNumber;
    private String customerName;
    private String accountType;
    private LocalDate expiryDate;

    public AuthSessionResponse() {
    }

    public AuthSessionResponse(boolean authenticated, String cardNumber, String maskedCardNumber,
                               String accountNumber, String customerName, String accountType,
                               LocalDate expiryDate) {
        this.authenticated = authenticated;
        this.cardNumber = cardNumber;
        this.maskedCardNumber = maskedCardNumber;
        this.accountNumber = accountNumber;
        this.customerName = customerName;
        this.accountType = accountType;
        this.expiryDate = expiryDate;
    }

    public static AuthSessionResponse unauthenticated() {
        AuthSessionResponse res = new AuthSessionResponse();
        res.setAuthenticated(false);
        return res;
    }

    public boolean isAuthenticated() {
        return authenticated;
    }

    public void setAuthenticated(boolean authenticated) {
        this.authenticated = authenticated;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getMaskedCardNumber() {
        return maskedCardNumber;
    }

    public void setMaskedCardNumber(String maskedCardNumber) {
        this.maskedCardNumber = maskedCardNumber;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }
}

