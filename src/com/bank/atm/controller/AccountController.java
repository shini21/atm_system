package com.bank.atm.controller;

import com.bank.atm.dto.response.AccountDetailsResponse;
import com.bank.atm.dto.response.ApiResponse;
import com.bank.atm.dto.response.BalanceResponse;
import com.bank.atm.service.AtmWebService;
import com.bank.atm.exceptions.AccountNotFoundException;
import jakarta.servlet.http.HttpSession;
import com.bank.atm.model.ATMCard;
import com.bank.atm.model.Account;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for account information and balance inquiries.
 */
@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final AtmWebService atmWebService;

    public AccountController(AtmWebService atmWebService) {
        this.atmWebService = atmWebService;
    }

    /**
     * Retrieves detailed profile and account information for the authenticated user.
     */
    @GetMapping("/details")
    public ResponseEntity<ApiResponse<AccountDetailsResponse>> getAccountDetails(HttpSession session)
            throws AccountNotFoundException {

        Account account = atmWebService.getAuthenticatedAccount(session);
        ATMCard card = atmWebService.getAuthenticatedCard(session);

        AccountDetailsResponse response = new AccountDetailsResponse(
                account.getOwner().getCustomerId(),
                account.getOwner().getFullName(),
                account.getOwner().getPhoneNumber(),
                account.getOwner().getEmail(),
                account.getAccountNumber(),
                AtmWebService.maskCardNumber(card.getCardNumber()),
                account.getAccountType(),
                account.getBalance(),
                account.getAvailableBalance(),
                account.getMinimumBalance()
        );

        return ResponseEntity.ok(ApiResponse.ok("Account details retrieved", response));
    }

    /**
     * Retrieves the real-time balance for the authenticated account.
     */
    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<BalanceResponse>> getBalance(HttpSession session)
            throws AccountNotFoundException {

        Account account = atmWebService.getAuthenticatedAccount(session);

        BalanceResponse response = new BalanceResponse(
                account.getAccountNumber(),
                account.getAccountType(),
                account.getBalance(),
                account.getAvailableBalance(),
                account.getMinimumBalance()
        );

        return ResponseEntity.ok(ApiResponse.ok("Balance retrieved successfully", response));
    }
}

