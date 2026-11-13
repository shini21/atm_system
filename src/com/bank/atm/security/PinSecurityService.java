package com.bank.atm.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PinSecurityService {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public String hashPin(String rawPin) {
        if (rawPin == null || !rawPin.matches("^\\d{4}$")) {
            throw new IllegalArgumentException("PIN must be exactly 4 digits.");
        }
        return passwordEncoder.encode(rawPin);
    }

    public boolean matches(String rawPin, String encodedPinHash) {
        if (rawPin == null || encodedPinHash == null) {
            return false;
        }
        // Backward-compatibility: if the stored value is an unhashed 4-digit PIN, allow direct match
        if (encodedPinHash.length() == 4 && encodedPinHash.equals(rawPin)) {
            return true;
        }
        return passwordEncoder.matches(rawPin, encodedPinHash);
    }
}

