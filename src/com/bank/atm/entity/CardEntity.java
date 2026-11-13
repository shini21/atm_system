package com.bank.atm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "cards")
public class CardEntity {

    @Id
    @Column(name = "card_number", length = 32, nullable = false)
    private String cardNumber;

    @Column(name = "pin_hash", length = 128, nullable = false)
    private String pinHash;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "failed_attempts", nullable = false)
    private int failedAttempts;

    @Column(name = "is_blocked", nullable = false)
    private boolean isBlocked;

    @Column(name = "linked_account_number", length = 32, nullable = false)
    private String linkedAccountNumber;

    public CardEntity() {
    }

    public CardEntity(String cardNumber, String pinHash, LocalDate expiryDate,
                      int failedAttempts, boolean isBlocked, String linkedAccountNumber) {
        this.cardNumber = cardNumber;
        this.pinHash = pinHash;
        this.expiryDate = expiryDate;
        this.failedAttempts = failedAttempts;
        this.isBlocked = isBlocked;
        this.linkedAccountNumber = linkedAccountNumber;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getPinHash() {
        return pinHash;
    }

    public void setPinHash(String pinHash) {
        this.pinHash = pinHash;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public int getFailedAttempts() {
        return failedAttempts;
    }

    public void setFailedAttempts(int failedAttempts) {
        this.failedAttempts = failedAttempts;
    }

    public boolean isBlocked() {
        return isBlocked;
    }

    public void setBlocked(boolean blocked) {
        isBlocked = blocked;
    }

    public String getLinkedAccountNumber() {
        return linkedAccountNumber;
    }

    public void setLinkedAccountNumber(String linkedAccountNumber) {
        this.linkedAccountNumber = linkedAccountNumber;
    }
}

