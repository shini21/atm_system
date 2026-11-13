package com.bank.atm.repository;

import com.bank.atm.entity.TransactionEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
    List<TransactionEntity> findByAccountNumberOrderByTimestampDesc(String accountNumber, Pageable pageable);
    List<TransactionEntity> findByAccountNumberOrderByTimestampDesc(String accountNumber);
    Optional<TransactionEntity> findByIdempotencyKey(String idempotencyKey);
    Optional<TransactionEntity> findByTransactionId(String transactionId);
}

