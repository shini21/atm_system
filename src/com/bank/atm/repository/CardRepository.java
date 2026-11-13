package com.bank.atm.repository;

import com.bank.atm.entity.CardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<CardEntity, String> {
    Optional<CardEntity> findByCardNumberIgnoreCase(String cardNumber);
}

