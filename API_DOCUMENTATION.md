# Apex Touch Banking — REST API Documentation

This document describes all REST API endpoints provided by the Java Spring Boot backend for the ATM simulation system.

**Base URL**: `http://localhost:8080/api`  
**Authentication**: HTTP Session (`JSESSIONID` cookie) or Bearer Token (`X-Auth-Token`)  
**Data Format**: JSON (`application/json`)

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Inspect Card Status
- **Method**: `POST`
- **Path**: `/api/auth/card`
- **Auth Required**: No
- **Request Body**:
```json
{
  "cardNumber": "CARD1001"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Card is valid and ready for PIN verification",
  "data": {
    "cardNumber": "CARD1001",
    "cardHolderName": "Aarav Sharma",
    "accountType": "Savings Account",
    "expiryDate": "2028-12-31",
    "isBlocked": false,
    "isExpired": false,
    "remainingAttempts": 3
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Card has expired (`CardExpiredException`).
  - `403 Forbidden`: Card is blocked (`CardBlockedException`).
  - `404 Not Found`: Card not registered in bank repository (`AccountNotFoundException`).

---

### 1.2 PIN Login & Session Creation
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Auth Required**: No
- **Request Body**:
```json
{
  "cardNumber": "CARD1001",
  "pin": "1234"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "authenticated": true,
    "maskedCardNumber": "**** **** 1001",
    "accountNumber": "ACC1001",
    "customerName": "Aarav Sharma"
  }
}
```
- **Error Responses**:
  - `401 Unauthorized`: Invalid PIN (`InvalidPinException`). Payload includes remaining attempts.
  - `403 Forbidden`: Card auto-blocked after 3 consecutive wrong PINs.

---

### 1.3 Active Session Check
- **Method**: `GET`
- **Path**: `/api/auth/session`
- **Auth Required**: Optional
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "maskedCardNumber": "**** **** 1001",
    "accountNumber": "ACC1001",
    "customerName": "Aarav Sharma"
  }
}
```

---

### 1.4 PIN Change
- **Method**: `POST`
- **Path**: `/api/auth/change-pin`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "currentPin": "1234",
  "newPin": "4321",
  "confirmPin": "4321"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "PIN changed successfully"
}
```

---

### 1.5 Logout & Session Invalidation
- **Method**: `POST`
- **Path**: `/api/auth/logout`
- **Auth Required**: Yes
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Logged out successfully. Card ejected."
}
```

---

## 2. Account Profile & Balance Endpoints (`/api/account`)

### 2.1 Complete Account Profile
- **Method**: `GET`
- **Path**: `/api/account/details`
- **Auth Required**: Yes
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "accountNumber": "ACC1001",
    "accountType": "Savings Account",
    "customerName": "Aarav Sharma",
    "phoneNumber": "9000000001",
    "email": "aarav.sharma@example.com",
    "currentBalance": 5000.00,
    "minimumBalance": 100.00,
    "availableToWithdraw": 4900.00,
    "maskedCardNumber": "**** **** 1001"
  }
}
```

---

### 2.2 Balance Inquiry
- **Method**: `GET`
- **Path**: `/api/account/balance`
- **Auth Required**: Yes
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "accountNumber": "ACC1001",
    "accountType": "Savings Account",
    "currentBalance": 5000.00,
    "minimumBalance": 100.00,
    "availableToWithdraw": 4900.00
  }
}
```

---

## 3. Financial Transaction Endpoints (`/api/transactions`)

### 3.1 Cash Deposit
- **Method**: `POST`
- **Path**: `/api/transactions/deposit`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "amount": 2000.00
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Deposit successful",
  "data": {
    "transactionId": "TXN-1005",
    "type": "DEPOSIT",
    "amount": 2000.00,
    "timestamp": "2026-11-13T18:23:00",
    "remarks": "Deposit of INR 2000.00",
    "balanceAfterTransaction": 7000.00
  }
}
```

---

### 3.2 Cash Withdrawal (with Denomination Breakdown)
- **Method**: `POST`
- **Path**: `/api/transactions/withdraw`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "amount": 2500.00
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Withdrawal successful",
  "data": {
    "transactionId": "TXN-1006",
    "type": "WITHDRAWAL",
    "amount": 2500.00,
    "timestamp": "2026-11-13T18:23:30",
    "remarks": "Withdrawal of INR 2500.00",
    "balanceAfterTransaction": 4500.00,
    "denominations": {
      "500": 5
    }
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Amount not a multiple of ₹100 or exceeds ₹20,000 per-transaction limit.
  - `400 Bad Request`: ATM cash inventory insufficient or cannot dispense exact note combination.
  - `400 Bad Request`: Account would fall below minimum balance (`InsufficientFundsException`).

---

### 3.3 Fund Transfer
- **Method**: `POST`
- **Path**: `/api/transactions/transfer`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "recipientAccountNumber": "ACC1002",
  "amount": 1000.00
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Transfer successful",
  "data": {
    "transactionId": "TXN-1007",
    "type": "TRANSFER_OUT",
    "amount": 1000.00,
    "timestamp": "2026-11-13T18:24:00",
    "remarks": "Transfer to ACC1002",
    "balanceAfterTransaction": 3500.00
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Transfer to same account (`InvalidAmountException`).
  - `404 Not Found`: Beneficiary account does not exist.

---

### 3.4 Recent Transactions / Mini-Statement
- **Method**: `GET`
- **Path**: `/api/transactions/recent?limit=5`
- **Auth Required**: Yes
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "transactionId": "TXN-1007",
      "type": "TRANSFER_OUT",
      "amount": 1000.00,
      "timestamp": "2026-11-13T18:24:00",
      "remarks": "Transfer to ACC1002",
      "balanceAfterTransaction": 3500.00
    }
  ]
}
```

---

## 4. ATM Hardware & Terminal Status (`/api/atm`)

### 4.1 ATM Hardware Status & Cash Availability
- **Method**: `GET`
- **Path**: `/api/atm/status`
- **Auth Required**: No
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "atmId": "ATM-MUM-04",
    "status": "ONLINE",
    "supportedDenominations": [500, 200, 100],
    "maxWithdrawalPerTransaction": 20000.00,
    "isCashAvailable": true
  }
}
```
