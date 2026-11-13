package com.bank.atm.dto.response;

import model.TransactionRecord;
import model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Clean DTO representing a transaction for frontend display.
 */
public class TransactionItemResponse {

    private String transactionId;
    private TransactionType type;
    private BigDecimal amount;
    private BigDecimal balanceAfterTransaction;
    private String description;
    private LocalDateTime timestamp;
    private java.util.Map<Integer, Integer> denominations;

    public TransactionItemResponse() {
    }

    public TransactionItemResponse(String transactionId, TransactionType type, BigDecimal amount,
                                   BigDecimal balanceAfterTransaction, String description,
                                   LocalDateTime timestamp) {
        this(transactionId, type, amount, balanceAfterTransaction, description, timestamp, null);
    }

    public TransactionItemResponse(String transactionId, TransactionType type, BigDecimal amount,
                                   BigDecimal balanceAfterTransaction, String description,
                                   LocalDateTime timestamp, java.util.Map<Integer, Integer> denominations) {
        this.transactionId = transactionId;
        this.type = type;
        this.amount = amount;
        this.balanceAfterTransaction = balanceAfterTransaction;
        this.description = description;
        this.timestamp = timestamp;
        this.denominations = denominations;
    }

    public static TransactionItemResponse from(TransactionRecord record) {
        return from(record, null);
    }

    public static TransactionItemResponse from(TransactionRecord record, java.util.Map<Integer, Integer> denominations) {
        return new TransactionItemResponse(
                record.getTransactionId(),
                record.getType(),
                record.getAmount(),
                record.getBalanceAfterTransaction(),
                record.getDescription(),
                record.getTimestamp(),
                denominations
        );
    }

    public java.util.Map<Integer, Integer> getDenominations() {
        return denominations;
    }

    public void setDenominations(java.util.Map<Integer, Integer> denominations) {
        this.denominations = denominations;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getBalanceAfterTransaction() {
        return balanceAfterTransaction;
    }

    public void setBalanceAfterTransaction(BigDecimal balanceAfterTransaction) {
        this.balanceAfterTransaction = balanceAfterTransaction;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}

