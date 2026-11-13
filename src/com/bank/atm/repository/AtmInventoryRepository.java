package com.bank.atm.repository;

import com.bank.atm.entity.AtmInventoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AtmInventoryRepository extends JpaRepository<AtmInventoryEntity, Integer> {
    List<AtmInventoryEntity> findAllByOrderByDenominationDesc();
}

