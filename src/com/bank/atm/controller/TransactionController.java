package com.bank.atm.controller;


import com.bank.atm.enums.TransactionType;
import com.bank.atm.dto.request.DepositRequest;
import com.bank.atm.dto.request.TransferRequest;
import com.bank.atm.dto.request.WithdrawRequest;
import com.bank.atm.dto.response.ApiResponse;
import com.bank.atm.dto.response.TransactionItemResponse;
import com.bank.atm.service.AtmWebService;
import com.bank.atm.exceptions.AccountNotFoundException;
import com.bank.atm.exceptions.InsufficientFundsException;
import com.bank.atm.exceptions.InvalidAmountException;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import com.bank.atm.model.TransactionRecord;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for executing ATM transactions (deposits, withdrawals, transfers, and history).
 */
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final AtmWebService atmWebService;

    public TransactionController(AtmWebService atmWebService) {
        this.atmWebService = atmWebService;
    }

    /**
     * Executes a cash deposit into the authenticated account.
     */
    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<TransactionItemResponse>> deposit(
            @Valid @RequestBody DepositRequest request,
            HttpSession session)
            throws AccountNotFoundException, InvalidAmountException {

        TransactionRecord record = atmWebService.deposit(request.getAmount(), session);
        return ResponseEntity.ok(ApiResponse.ok("Deposit successful", TransactionItemResponse.from(record)));
    }

    /**
     * Executes a cash withdrawal from the authenticated account.
     */
    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<TransactionItemResponse>> withdraw(
            @Valid @RequestBody WithdrawRequest request,
            HttpSession session)
            throws AccountNotFoundException, InvalidAmountException, InsufficientFundsException {

        com.bank.atm.service.AtmPersistenceService.WithdrawalResult result =
                atmWebService.withdrawWithBreakdown(request.getAmount(), session);
        return ResponseEntity.ok(ApiResponse.ok("Withdrawal successful",
                TransactionItemResponse.from(result.getRecord(), result.getBreakdown())));
    }

    /**
     * Executes an account-to-account transfer.
     */
    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransactionItemResponse>> transfer(
            @Valid @RequestBody TransferRequest request,
            HttpSession session)
            throws AccountNotFoundException, InvalidAmountException, InsufficientFundsException {

        TransactionRecord record = atmWebService.transfer(
                request.getRecipientAccountNumber(),
                request.getAmount(),
                session
        );
        return ResponseEntity.ok(ApiResponse.ok("Transfer successful", TransactionItemResponse.from(record)));
    }

    /**
     * Retrieves recent transactions for the authenticated account (newest first).
     */
    @GetMapping({"/recent", "/history"})
    public ResponseEntity<ApiResponse<List<TransactionItemResponse>>> getRecentTransactions(
            @RequestParam(defaultValue = "5") int limit,
            HttpSession session)
            throws AccountNotFoundException {

        List<TransactionRecord> records = atmWebService.getRecentTransactions(session, limit);
        List<TransactionItemResponse> items = records.stream()
                .map(TransactionItemResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Recent transactions retrieved", items));
    }
}

