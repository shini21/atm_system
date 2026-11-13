package com.bank.atm.entity;


import com.bank.atm.enums.TransactionType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class TransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", length = 64, nullable = false, unique = true)
    private String transactionId;

    @Column(name = "account_number", length = 32, nullable = false)
    private String accountNumber;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "type", length = 32, nullable = false)
    private String type;

    @Column(name = "debit_credit", length = 16, nullable = false)
    private String debitCredit;

    @Column(name = "amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "balance_after", precision = 15, scale = 2, nullable = false)
    private BigDecimal balanceAfter;

    @Column(name = "remarks", length = 256)
    private String remarks;

    @Column(name = "idempotency_key", length = 128)
    private String idempotencyKey;

    @Column(name = "note_breakdown", length = 256)
    private String noteBreakdown;

    public TransactionEntity() {
    }

    public TransactionEntity(String transactionId, String accountNumber, LocalDateTime timestamp,
                             String type, String debitCredit, BigDecimal amount,
                             BigDecimal balanceAfter, String remarks, String idempotencyKey,
                             String noteBreakdown) {
        this.transactionId = transactionId;
        this.accountNumber = accountNumber;
        this.timestamp = timestamp;
        this.type = type;
        this.debitCredit = debitCredit;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.remarks = remarks;
        this.idempotencyKey = idempotencyKey;
        this.noteBreakdown = noteBreakdown;
    }

    public Long getId() {
        return id;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDebitCredit() {
        return debitCredit;
    }

    public void setDebitCredit(String debitCredit) {
        this.debitCredit = debitCredit;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getBalanceAfter() {
        return balanceAfter;
    }

    public void setBalanceAfter(BigDecimal balanceAfter) {
        this.balanceAfter = balanceAfter;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public String getNoteBreakdown() {
        return noteBreakdown;
    }

    public void setNoteBreakdown(String noteBreakdown) {
        this.noteBreakdown = noteBreakdown;
    }
}

