package com.bank.atm;



import com.bank.atm.service.*;
import com.bank.atm.config.*;
import com.bank.atm.dto.request.*;
import com.bank.atm.dto.response.*;
import com.bank.atm.entity.*;
import com.bank.atm.repository.*;
import com.bank.atm.interfaces.*;
import com.bank.atm.model.*;
import com.bank.atm.enums.*;
import com.bank.atm.exceptions.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AtmHardwareTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("API: GET /api/atm/status returns terminal hardware state, inventory & limits")
    void testGetAtmStatus() throws Exception {
        mockMvc.perform(get("/api/atm/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.atmId").value("ATM-MUM-04"))
                .andExpect(jsonPath("$.data.terminalModel").value("Apex Prime X-9000"))
                .andExpect(jsonPath("$.data.status").value("ONLINE"))
                .andExpect(jsonPath("$.data.supportedDenominations.length()").value(3))
                .andExpect(jsonPath("$.data.maxWithdrawalPerTransaction").value(20000.00))
                .andExpect(jsonPath("$.data.isCashAvailable").value(true));
    }

    @Test
    @DisplayName("API: POST /api/atm/unblock resets blocked card CARD1004 so it becomes ACTIVE")
    void testUnblockCardEndpoint() throws Exception {
        // 1. Initial check: CARD1004 is blocked -> 403 Forbidden
        CardCheckRequest req = new CardCheckRequest("CARD1004");
        mockMvc.perform(post("/api/auth/card")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("is blocked")));

        // 2. Call unblock endpoint
        mockMvc.perform(post("/api/atm/unblock?cardNumber=CARD1004"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("CARD1004"));

        // 3. Check again: CARD1004 is now ACTIVE -> 200 OK
        mockMvc.perform(post("/api/auth/card")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.blocked").value(false));
    }
}

