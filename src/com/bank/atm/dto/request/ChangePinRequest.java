package com.bank.atm.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ChangePinRequest {

    @NotBlank(message = "Current PIN is required")
    @Pattern(regexp = "^\\d{4}$", message = "Current PIN must be exactly 4 digits")
    private String currentPin;

    @NotBlank(message = "New PIN is required")
    @Pattern(regexp = "^\\d{4}$", message = "New PIN must be exactly 4 digits")
    private String newPin;

    @NotBlank(message = "Confirm new PIN is required")
    @Pattern(regexp = "^\\d{4}$", message = "Confirm PIN must be exactly 4 digits")
    private String confirmPin;

    public ChangePinRequest() {
    }

    public ChangePinRequest(String currentPin, String newPin, String confirmPin) {
        this.currentPin = currentPin;
        this.newPin = newPin;
        this.confirmPin = confirmPin;
    }

    public String getCurrentPin() {
        return currentPin;
    }

    public void setCurrentPin(String currentPin) {
        this.currentPin = currentPin;
    }

    public String getNewPin() {
        return newPin;
    }

    public void setNewPin(String newPin) {
        this.newPin = newPin;
    }

    public String getConfirmPin() {
        return confirmPin;
    }

    public void setConfirmPin(String confirmPin) {
        this.confirmPin = confirmPin;
    }
}

