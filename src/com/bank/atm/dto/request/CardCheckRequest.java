package com.bank.atm.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CardCheckRequest {

    @NotBlank(message = "Card number is required")
    private String cardNumber;

    public CardCheckRequest() {
    }

    public CardCheckRequest(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }
}

