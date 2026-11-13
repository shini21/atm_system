package com.bank.atm.dto.response;

import java.time.LocalDate;

/**
 * Response returned when a card is checked/inserted.
 */
public class CardStatusResponse {

    private String cardNumber;
    private String maskedCardNumber;
    private String cardHolderName;
    private String accountType;
    private LocalDate expiryDate;
    private boolean blocked;
    private boolean expired;
    private int remainingAttempts;

    public CardStatusResponse() {
    }

    public CardStatusResponse(String cardNumber, String maskedCardNumber, String cardHolderName,
                              String accountType, LocalDate expiryDate, boolean blocked,
                              boolean expired, int remainingAttempts) {
        this.cardNumber = cardNumber;
        this.maskedCardNumber = maskedCardNumber;
        this.cardHolderName = cardHolderName;
        this.accountType = accountType;
        this.expiryDate = expiryDate;
        this.blocked = blocked;
        this.expired = expired;
        this.remainingAttempts = remainingAttempts;
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

    public String getCardHolderName() {
        return cardHolderName;
    }

    public void setCardHolderName(String cardHolderName) {
        this.cardHolderName = cardHolderName;
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

    public boolean isBlocked() {
        return blocked;
    }

    public void setBlocked(boolean blocked) {
        this.blocked = blocked;
    }

    public boolean isExpired() {
        return expired;
    }

    public void setExpired(boolean expired) {
        this.expired = expired;
    }

    public int getRemainingAttempts() {
        return remainingAttempts;
    }

    public void setRemainingAttempts(int remainingAttempts) {
        this.remainingAttempts = remainingAttempts;
    }
}

