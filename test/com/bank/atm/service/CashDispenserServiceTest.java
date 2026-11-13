package com.bank.atm.service;

import com.bank.atm.entity.AtmInventoryEntity;
import com.bank.atm.repository.AtmInventoryRepository;
import exceptions.InvalidAmountException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CashDispenserServiceTest {

    private AtmInventoryRepository inventoryRepository;
    private CashDispenserService cashDispenserService;

    @BeforeEach
    void setUp() {
        inventoryRepository = Mockito.mock(AtmInventoryRepository.class);
        cashDispenserService = new CashDispenserService(inventoryRepository);
    }

    private void mockInventory(int count500, int count200, int count100) {
        List<AtmInventoryEntity> inventory = Arrays.asList(
                new AtmInventoryEntity(500, count500),
                new AtmInventoryEntity(200, count200),
                new AtmInventoryEntity(100, count100)
        );
        when(inventoryRepository.findAllByOrderByDenominationDesc()).thenReturn(inventory);
        when(inventoryRepository.findAll()).thenReturn(inventory);
        when(inventoryRepository.findById(500)).thenReturn(Optional.of(new AtmInventoryEntity(500, count500)));
        when(inventoryRepository.findById(200)).thenReturn(Optional.of(new AtmInventoryEntity(200, count200)));
        when(inventoryRepository.findById(100)).thenReturn(Optional.of(new AtmInventoryEntity(100, count100)));
    }

    @Test
    @DisplayName("calculateBreakdown: Greedy breakdown for standard amount 2800 with full inventory")
    void testStandardGreedyBreakdown() throws InvalidAmountException {
        // ATM has 40x500 (20000), 50x200 (10000), 50x100 (5000)
        mockInventory(40, 50, 50);

        Map<Integer, Integer> breakdown = cashDispenserService.calculateBreakdown(new BigDecimal("2800.00"));

        assertNotNull(breakdown);
        // 2800 -> 5 x 500 (2500) + 1 x 200 (200) + 1 x 100 (100)
        assertEquals(5, breakdown.get(500));
        assertEquals(1, breakdown.get(200));
        assertEquals(1, breakdown.get(100));
    }

    @Test
    @DisplayName("calculateBreakdown: Fallback when 500 notes are depleted")
    void testFallbackWhenDenominationDepleted() throws InvalidAmountException {
        // No 500s; 20x200 (4000), 30x100 (3000)
        mockInventory(0, 20, 30);

        Map<Integer, Integer> breakdown = cashDispenserService.calculateBreakdown(new BigDecimal("1500.00"));

        assertNotNull(breakdown);
        assertNull(breakdown.get(500));
        assertEquals(7, breakdown.get(200)); // 1400
        assertEquals(1, breakdown.get(100)); // 100
    }

    @Test
    @DisplayName("calculateBreakdown: Rejects non-multiples of 100")
    void testRejectsNonMultipleOf100() {
        mockInventory(40, 50, 50);

        InvalidAmountException ex1 = assertThrows(InvalidAmountException.class, () ->
                cashDispenserService.calculateBreakdown(new BigDecimal("150.00")));
        assertTrue(ex1.getMessage().contains("multiple of INR 100"));

        InvalidAmountException ex2 = assertThrows(InvalidAmountException.class, () ->
                cashDispenserService.calculateBreakdown(new BigDecimal("99.99")));
        assertTrue(ex2.getMessage().contains("multiple of INR 100"));
    }

    @Test
    @DisplayName("calculateBreakdown: Rejects non-positive amounts")
    void testRejectsNonPositiveAmounts() {
        mockInventory(40, 50, 50);

        assertThrows(InvalidAmountException.class, () ->
                cashDispenserService.calculateBreakdown(BigDecimal.ZERO));
        assertThrows(InvalidAmountException.class, () ->
                cashDispenserService.calculateBreakdown(new BigDecimal("-500.00")));
    }

    @Test
    @DisplayName("calculateBreakdown: Rejects amounts exceeding MAX_WITHDRAWAL_LIMIT (20,000)")
    void testRejectsOverLimit() {
        mockInventory(100, 100, 100);

        InvalidAmountException ex = assertThrows(InvalidAmountException.class, () ->
                cashDispenserService.calculateBreakdown(new BigDecimal("20100.00")));
        assertTrue(ex.getMessage().contains("Maximum withdrawal limit per transaction is INR 20,000.00"));
    }

    @Test
    @DisplayName("calculateBreakdown: Throws exception when ATM lacks sufficient inventory")
    void testThrowsWhenAtmOutOfCash() {
        // ATM has only 1x100 note
        mockInventory(0, 0, 1);

        InvalidAmountException ex = assertThrows(InvalidAmountException.class, () ->
                cashDispenserService.calculateBreakdown(new BigDecimal("500.00")));
        assertTrue(ex.getMessage().contains("cannot dispense this exact amount"));
    }

    @Test
    @DisplayName("dispenseCash: Decrements inventory records in repository")
    void testDispenseCash() {
        mockInventory(10, 10, 10);

        Map<Integer, Integer> breakdown = Map.of(500, 2, 200, 1, 100, 3);
        cashDispenserService.dispenseCash(breakdown);

        verify(inventoryRepository, times(3)).save(any(AtmInventoryEntity.class));
    }

    @Test
    @DisplayName("getTotalCashAvailable: Correctly computes total reserve value")
    void testGetTotalCashAvailable() {
        // 40*500 (20000) + 50*200 (10000) + 50*100 (5000) = 35000.00
        mockInventory(40, 50, 50);

        BigDecimal total = cashDispenserService.getTotalCashAvailable();
        assertEquals(new BigDecimal("35000.00"), total);
    }
}

