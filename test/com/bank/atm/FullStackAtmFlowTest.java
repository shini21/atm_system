package com.bank.atm;

import com.bank.atm.dto.request.CardCheckRequest;
import com.bank.atm.dto.request.ChangePinRequest;
import com.bank.atm.dto.request.DepositRequest;
import com.bank.atm.dto.request.LoginRequest;
import com.bank.atm.dto.request.TransferRequest;
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

/**
 * End-to-end integration test verifying the complete user journey across all ATM operations
 * through the REST API endpoints matching the frontend client behavior.
 */
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class FullStackAtmFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Complete ATM Journey: Card Check -> Login -> Balance -> Deposit -> Withdraw -> Transfer -> History -> Change PIN -> Logout")
    void testCompleteAtmJourney() throws Exception {
        MockHttpSession session = new MockHttpSession();

        // 1. Check Card CARD1001
        CardCheckRequest cardReq = new CardCheckRequest("CARD1001");
        mockMvc.perform(post("/api/auth/card")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cardReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.cardHolderName").value("Aarav Sharma"))
                .andExpect(jsonPath("$.data.blocked").value(false))
                .andExpect(jsonPath("$.data.expired").value(false));

        // 2. Login with PIN 1234
        LoginRequest loginReq = new LoginRequest("CARD1001", "1234");
        mockMvc.perform(post("/api/auth/login")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.authenticated").value(true));

        // 3. Verify Session
        mockMvc.perform(get("/api/auth/session").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.authenticated").value(true))
                .andExpect(jsonPath("$.data.customerName").value("Aarav Sharma"));

        // 3b. Verify Account Details Endpoint
        mockMvc.perform(get("/api/account/details").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Aarav Sharma"))
                .andExpect(jsonPath("$.data.accountNumber").value("ACC1001"));

        // 4. Initial Balance Inquiry (Opening: 5000.00, Min Balance: 100.00, Available: 4900.00)
        mockMvc.perform(get("/api/account/balance").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentBalance").value(5000.00))
                .andExpect(jsonPath("$.data.availableBalance").value(4900.00))
                .andExpect(jsonPath("$.data.minimumBalance").value(100.00));

        // 5. Deposit 1500.00 -> New Balance: 6500.00, Available: 6400.00
        DepositRequest depositReq = new DepositRequest(new BigDecimal("1500.00"));
        mockMvc.perform(post("/api/transactions/deposit")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(depositReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.type").value("DEPOSIT"))
                .andExpect(jsonPath("$.data.amount").value(1500.00))
                .andExpect(jsonPath("$.data.balanceAfterTransaction").value(6500.00));

        // 6. Withdraw 500.00 -> New Balance: 6000.00, Available: 5900.00
        WithdrawRequest withdrawReq = new WithdrawRequest(new BigDecimal("500.00"));
        mockMvc.perform(post("/api/transactions/withdraw")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(withdrawReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.type").value("WITHDRAWAL"))
                .andExpect(jsonPath("$.data.amount").value(500.00))
                .andExpect(jsonPath("$.data.balanceAfterTransaction").value(6000.00));

        // 7. Transfer 1000.00 to Priya (ACC1002) -> New Balance: 5000.00
        TransferRequest transferReq = new TransferRequest("ACC1002", new BigDecimal("1000.00"));
        mockMvc.perform(post("/api/transactions/transfer")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transferReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.type").value("TRANSFER_OUT"))
                .andExpect(jsonPath("$.data.amount").value(1000.00))
                .andExpect(jsonPath("$.data.balanceAfterTransaction").value(5000.00));

        // 8. Transaction History should contain the operations (Deposit, Withdrawal, Transfer)
        mockMvc.perform(get("/api/transactions/recent").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(3))
                .andExpect(jsonPath("$.data[0].type").value("TRANSFER_OUT"))
                .andExpect(jsonPath("$.data[1].type").value("WITHDRAWAL"))
                .andExpect(jsonPath("$.data[2].type").value("DEPOSIT"));

        // 9. Change PIN from 1234 to 2468
        ChangePinRequest pinReq = new ChangePinRequest("1234", "2468", "2468");
        mockMvc.perform(post("/api/auth/change-pin")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pinReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 10. Logout / Eject Card
        mockMvc.perform(post("/api/auth/logout").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 11. Subsequent access with invalidated session returns 401 Unauthorized
        mockMvc.perform(get("/api/account/details").session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Edge Case: 3 Failed PIN Attempts blocks the card")
    void testThreeFailedPinAttemptsBlocksCard() throws Exception {
        MockHttpSession session = new MockHttpSession();

        // 1st failed attempt
        LoginRequest badPin1 = new LoginRequest("CARD1002", "0000");
        mockMvc.perform(post("/api/auth/login")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badPin1)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("2 attempt(s) remaining")));

        // 2nd failed attempt
        mockMvc.perform(post("/api/auth/login")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badPin1)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("1 attempt(s) remaining")));

        // 3rd failed attempt -> card is blocked!
        mockMvc.perform(post("/api/auth/login")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badPin1)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Card has been blocked")));

        // Checking card now returns 403 Forbidden
        CardCheckRequest cardReq = new CardCheckRequest("CARD1002");
        mockMvc.perform(post("/api/auth/card")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cardReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("is blocked")));
    }

    @Test
    @DisplayName("Edge Case: Expired card CARD1003 is rejected with 400 Bad Request")
    void testExpiredCardRejected() throws Exception {
        CardCheckRequest cardReq = new CardCheckRequest("CARD1003");
        mockMvc.perform(post("/api/auth/card")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cardReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("expired")));
    }

    @Test
    @DisplayName("Edge Case: Pre-blocked card CARD1004 is rejected with 403 Forbidden")
    void testPreBlockedCardRejected() throws Exception {
        CardCheckRequest cardReq = new CardCheckRequest("CARD1004");
        mockMvc.perform(post("/api/auth/card")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cardReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("is blocked")));
    }
}

