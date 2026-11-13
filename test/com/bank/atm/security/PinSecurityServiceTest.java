package com.bank.atm.security;


import com.bank.atm.model.*;
import com.bank.atm.enums.*;
import com.bank.atm.exceptions.*;
import com.bank.atm.service.*;
import com.bank.atm.config.*;
import com.bank.atm.dto.request.*;
import com.bank.atm.dto.response.*;
import com.bank.atm.entity.*;
import com.bank.atm.repository.*;
import com.bank.atm.interfaces.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PinSecurityServiceTest {

    private PinSecurityService pinSecurityService;

    @BeforeEach
    void setUp() {
        pinSecurityService = new PinSecurityService();
    }

    @Test
    @DisplayName("hashPin: Successfully hashes a valid 4-digit PIN")
    void testHashValidPin() {
        String hash = pinSecurityService.hashPin("1234");
        assertNotNull(hash);
        assertTrue(hash.startsWith("$2a$") || hash.startsWith("$2b$"));
        assertTrue(pinSecurityService.matches("1234", hash));
        assertFalse(pinSecurityService.matches("9999", hash));
    }

    @Test
    @DisplayName("hashPin: Rejects non-4-digit strings")
    void testHashInvalidPin() {
        assertThrows(IllegalArgumentException.class, () -> pinSecurityService.hashPin("123"));
        assertThrows(IllegalArgumentException.class, () -> pinSecurityService.hashPin("12345"));
        assertThrows(IllegalArgumentException.class, () -> pinSecurityService.hashPin("abcd"));
        assertThrows(IllegalArgumentException.class, () -> pinSecurityService.hashPin(null));
    }

    @Test
    @DisplayName("matches: Supports legacy plain text fallback and BCrypt hashes")
    void testLegacyPlainTextFallback() {
        assertTrue(pinSecurityService.matches("1234", "1234"));
        assertFalse(pinSecurityService.matches("1234", "5678"));
        assertFalse(pinSecurityService.matches(null, "1234"));
        assertFalse(pinSecurityService.matches("1234", null));
    }
}

