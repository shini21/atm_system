package com.bank.atm.controller;

import com.bank.atm.dto.request.CardCheckRequest;
import com.bank.atm.dto.request.ChangePinRequest;
import com.bank.atm.dto.request.LoginRequest;
import com.bank.atm.dto.response.ApiResponse;
import com.bank.atm.dto.response.AuthSessionResponse;
import com.bank.atm.dto.response.CardStatusResponse;
import com.bank.atm.service.AtmWebService;
import com.bank.atm.exceptions.AccountNotFoundException;
import com.bank.atm.exceptions.CardBlockedException;
import com.bank.atm.exceptions.CardExpiredException;
import com.bank.atm.exceptions.InvalidPinException;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import com.bank.atm.model.ATMCard;
import com.bank.atm.model.Account;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.bank.atm.service.Bank;

/**
 * REST controller for ATM authentication and session management.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AtmWebService atmWebService;
    private final Bank bank;

    public AuthController(AtmWebService atmWebService, Bank bank) {
        this.atmWebService = atmWebService;
        this.bank = bank;
    }

    /**
     * Validates card existence, block status, and expiry before PIN entry.
     */
    @PostMapping("/card")
    public ResponseEntity<ApiResponse<CardStatusResponse>> checkCard(@Valid @RequestBody CardCheckRequest request)
            throws AccountNotFoundException, CardBlockedException, CardExpiredException {
        ATMCard card = atmWebService.checkCard(request.getCardNumber());
        Account account = bank.getAccountForCard(card);

        CardStatusResponse response = new CardStatusResponse(
                card.getCardNumber(),
                AtmWebService.maskCardNumber(card.getCardNumber()),
                account.getOwner().getFullName(),
                account.getAccountType(),
                card.getExpiryDate(),
                card.isBlocked(),
                card.isExpired(),
                card.getRemainingAttempts()
        );

        return ResponseEntity.ok(ApiResponse.ok("Card accepted. Please enter your PIN.", response));
    }

    /**
     * Authenticates the user with 4-digit PIN and establishes a session.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthSessionResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpSession session)
            throws AccountNotFoundException, CardBlockedException, CardExpiredException, InvalidPinException {

        Account account = atmWebService.login(request.getCardNumber(), request.getPin(), session);
        ATMCard card = bank.findCardByNumber(request.getCardNumber());

        AuthSessionResponse sessionResponse = new AuthSessionResponse(
                true,
                card.getCardNumber(),
                AtmWebService.maskCardNumber(card.getCardNumber()),
                account.getAccountNumber(),
                account.getOwner().getFullName(),
                account.getAccountType(),
                card.getExpiryDate()
        );

        return ResponseEntity.ok(ApiResponse.ok("Authentication successful. Welcome, "
                + account.getOwner().getFullName() + "!", sessionResponse));
    }

    /**
     * Retrieves the current authentication session status.
     */
    @GetMapping("/session")
    public ResponseEntity<ApiResponse<AuthSessionResponse>> getSession(HttpSession session)
            throws AccountNotFoundException {
        String cardNumber = (String) session.getAttribute(AtmWebService.SESSION_CARD_NUMBER);
        if (cardNumber == null) {
            return ResponseEntity.ok(ApiResponse.ok("No active session", AuthSessionResponse.unauthenticated()));
        }

        ATMCard card = bank.findCardByNumber(cardNumber);
        Account account = bank.getAccountForCard(card);

        AuthSessionResponse sessionResponse = new AuthSessionResponse(
                true,
                card.getCardNumber(),
                AtmWebService.maskCardNumber(card.getCardNumber()),
                account.getAccountNumber(),
                account.getOwner().getFullName(),
                account.getAccountType(),
                card.getExpiryDate()
        );

        return ResponseEntity.ok(ApiResponse.ok("Active session found", sessionResponse));
    }

    /**
     * Invalidates the ATM session and ejects the card.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpSession session) {
        atmWebService.logout(session);
        return ResponseEntity.ok(ApiResponse.ok("Card ejected successfully. Thank you for banking with us!", null));
    }

    /**
     * Changes the PIN of the authenticated card.
     */
    @PostMapping("/change-pin")
    public ResponseEntity<ApiResponse<Void>> changePin(
            @Valid @RequestBody ChangePinRequest request,
            HttpSession session)
            throws AccountNotFoundException, InvalidPinException {

        atmWebService.changePin(request.getCurrentPin(), request.getNewPin(), request.getConfirmPin(), session);
        return ResponseEntity.ok(ApiResponse.ok("PIN changed successfully.", null));
    }
}

