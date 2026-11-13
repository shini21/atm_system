package com.bank.atm;

import com.bank.atm.dto.request.CardCheckRequest;
import com.bank.atm.dto.request.DepositRequest;
import com.bank.atm.dto.request.LoginRequest;
import com.bank.atm.dto.request.WithdrawRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AtmIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("API: Check valid card returns 200 OK")
    void testCheckCardEndpoint() throws Exception {
        CardCheckRequest request = new CardCheckRequest("CARD1002");

        mockMvc.perform(post("/api/auth/card")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.cardNumber").value("CARD1002"))
                .andExpect(jsonPath("$.data.cardHolderName").value("Priya Patel"))
                .andExpect(jsonPath("$.data.accountType").value("Current Account"));
    }

    @Test
    @DisplayName("API: Login with valid credentials establishes session")
    void testLoginAndBalanceEndpoint() throws Exception {
        LoginRequest loginRequest = new LoginRequest("CARD1002", "5678");
        MockHttpSession session = new MockHttpSession();

        mockMvc.perform(post("/api/auth/login")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.authenticated").value(true))
                .andExpect(jsonPath("$.data.customerName").value("Priya Patel"));

        // Check balance with session
        mockMvc.perform(get("/api/account/balance")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.currentBalance").value(12000.00));
    }

    @Test
    @DisplayName("API: Deposit and Withdrawal endpoints update balance")
    void testDepositAndWithdrawEndpoints() throws Exception {
        LoginRequest loginRequest = new LoginRequest("CARD1001", "1234");
        MockHttpSession session = new MockHttpSession();

        mockMvc.perform(post("/api/auth/login")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk());

        // Deposit 1000
        DepositRequest depositReq = new DepositRequest(new BigDecimal("1000.00"));
        mockMvc.perform(post("/api/transactions/deposit")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(depositReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.type").value("DEPOSIT"))
                .andExpect(jsonPath("$.data.amount").value(1000.00));

        // Withdraw 500
        WithdrawRequest withdrawReq = new WithdrawRequest(new BigDecimal("500.00"));
        mockMvc.perform(post("/api/transactions/withdraw")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(withdrawReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.type").value("WITHDRAWAL"))
                .andExpect(jsonPath("$.data.amount").value(500.00));

        // Recent transactions should have 2 entries
        mockMvc.perform(get("/api/transactions/recent")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    @DisplayName("API: Unauthenticated request to /api/account/details returns 401 Unauthorized")
    void testUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/account/details"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }
}

