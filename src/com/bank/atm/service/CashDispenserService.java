package com.bank.atm.service;

import com.bank.atm.entity.AtmInventoryEntity;
import com.bank.atm.repository.AtmInventoryRepository;
import com.bank.atm.exceptions.InvalidAmountException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CashDispenserService {

    public static final BigDecimal MAX_WITHDRAWAL_LIMIT = new BigDecimal("20000.00");
    public static final int[] SUPPORTED_DENOMINATIONS = {500, 200, 100};

    private final AtmInventoryRepository inventoryRepository;

    public CashDispenserService(AtmInventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Computes the note breakdown for a given withdrawal amount based on currently
     * available ATM inventory.
     *
     * @param amount the withdrawal amount
     * @return Map of denomination -> count (e.g. {500: 4, 200: 2, 100: 1})
     * @throws InvalidAmountException if amount is invalid, exceeds limit, or cannot be dispensed
     */
    public Map<Integer, Integer> calculateBreakdown(BigDecimal amount) throws InvalidAmountException {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidAmountException("Withdrawal amount must be strictly greater than zero.");
        }
        if (amount.remainder(BigDecimal.valueOf(100)).compareTo(BigDecimal.ZERO) != 0) {
            throw new InvalidAmountException("Withdrawal amount must be a multiple of INR 100.");
        }
        if (amount.compareTo(MAX_WITHDRAWAL_LIMIT) > 0) {
            throw new InvalidAmountException("Maximum withdrawal limit per transaction is INR 20,000.00.");
        }

        int remaining = amount.intValueExact();
        List<AtmInventoryEntity> inventory = inventoryRepository.findAllByOrderByDenominationDesc();
        Map<Integer, Integer> availableMap = new LinkedHashMap<>();
        for (AtmInventoryEntity inv : inventory) {
            availableMap.put(inv.getDenomination(), inv.getNoteCount());
        }

        Map<Integer, Integer> breakdown = new LinkedHashMap<>();
        for (int denom : SUPPORTED_DENOMINATIONS) {
            int availableNotes = availableMap.getOrDefault(denom, 0);
            if (availableNotes > 0 && remaining >= denom) {
                int needed = remaining / denom;
                int toDispense = Math.min(needed, availableNotes);
                if (toDispense > 0) {
                    breakdown.put(denom, toDispense);
                    remaining -= (toDispense * denom);
                }
            }
        }

        if (remaining > 0) {
            throw new InvalidAmountException("ATM cash inventory cannot dispense this exact amount. Please choose another amount.");
        }

        return breakdown;
    }

    /**
     * Decrements the ATM inventory upon successful cash dispensing.
     */
    @Transactional
    public void dispenseCash(Map<Integer, Integer> breakdown) {
        for (Map.Entry<Integer, Integer> entry : breakdown.entrySet()) {
            int denom = entry.getKey();
            int count = entry.getValue();
            AtmInventoryEntity entity = inventoryRepository.findById(denom)
                    .orElse(new AtmInventoryEntity(denom, 0));
            int newCount = Math.max(0, entity.getNoteCount() - count);
            entity.setNoteCount(newCount);
            inventoryRepository.save(entity);
        }
    }

    /**
     * Increments the ATM inventory upon cash deposit.
     */
    @Transactional
    public void acceptDeposit(BigDecimal amount) {
        // Distribute deposited amount into inventory (favoring 500s and 200s)
        int remaining = amount.intValueExact();
        for (int denom : SUPPORTED_DENOMINATIONS) {
            if (remaining >= denom) {
                int count = remaining / denom;
                AtmInventoryEntity entity = inventoryRepository.findById(denom)
                        .orElse(new AtmInventoryEntity(denom, 0));
                entity.setNoteCount(entity.getNoteCount() + count);
                inventoryRepository.save(entity);
                remaining %= denom;
            }
        }
    }

    /**
     * Returns the total amount of cash currently in the ATM.
     */
    public BigDecimal getTotalCashAvailable() {
        List<AtmInventoryEntity> inventory = inventoryRepository.findAll();
        int total = 0;
        for (AtmInventoryEntity inv : inventory) {
            total += (inv.getDenomination() * inv.getNoteCount());
        }
        return BigDecimal.valueOf(total).setScale(2);
    }
}

