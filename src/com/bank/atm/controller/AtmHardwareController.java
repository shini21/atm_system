package com.bank.atm.controller;

import com.bank.atm.dto.response.ApiResponse;
import com.bank.atm.service.AtmWebService;
import com.bank.atm.service.CashDispenserService;
import com.bank.atm.exceptions.AccountNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/atm")
public class AtmHardwareController {

    private final CashDispenserService cashDispenserService;
    private final AtmWebService atmWebService;

    public AtmHardwareController(CashDispenserService cashDispenserService, AtmWebService atmWebService) {
        this.cashDispenserService = cashDispenserService;
        this.atmWebService = atmWebService;
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAtmStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("atmId", "ATM-MUM-04");
        status.put("terminalModel", "Apex Prime X-9000");
        status.put("status", "ONLINE");
        status.put("supportedDenominations", CashDispenserService.SUPPORTED_DENOMINATIONS);
        status.put("maxWithdrawalPerTransaction", CashDispenserService.MAX_WITHDRAWAL_LIMIT);
        BigDecimal totalCash = cashDispenserService.getTotalCashAvailable();
        status.put("totalCashAvailable", totalCash);
        status.put("isCashAvailable", totalCash.compareTo(BigDecimal.valueOf(100)) >= 0);

        return ResponseEntity.ok(ApiResponse.ok("ATM terminal status retrieved", status));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("service", "apex-atm-backend");
        health.put("timestamp", java.time.Instant.now().toString());
        health.put("version", "1.0.0");
        return ResponseEntity.ok(health);
    }

    @PostMapping("/unblock")
    public ResponseEntity<ApiResponse<String>> unblockCard(@RequestParam String cardNumber)
            throws AccountNotFoundException {
        atmWebService.unblockCard(cardNumber);
        return ResponseEntity.ok(ApiResponse.ok("Card " + cardNumber + " has been successfully unblocked for demo.", cardNumber));
    }
}

