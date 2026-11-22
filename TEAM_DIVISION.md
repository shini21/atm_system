# APEX Touch Banking — Team Division & Project Ownership Matrix

> **Project Name**: APEX Touch Banking (Modern Physical ATM Simulation System)  
> **Course**: Object-Oriented Programming / Capstone Project  
> **Team Size**: 4 Members  
> **Live Demo**: [https://atmsystem-frontend.vercel.app/](https://atmsystem-frontend.vercel.app/)  
> **Backend API**: `https://atm-system-dz11.onrender.com/`

---

## Executive Summary of Team Roles

The APEX Touch Banking system has been architected to cleanly divide responsibilities into four distinct, enterprise-grade engineering modules. Each member owns an independent, deeply articulated area of the full-stack system:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 APEX TOUCH BANKING TERMINAL                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
         ┌──────────────────────────────────────┴──────────────────────────────────────┐
         ▼                                                                             ▼
┌─────────────────────────────────┐                                   ┌─────────────────────────────────┐
│       FRONTEND SUBSYSTEM        │                                   │        BACKEND SUBSYSTEM        │
│    (React 19, TypeScript,       │                                   │     (Spring Boot 3.3.4,         │
│      Vite 6, Tailwind CSS)      │                                   │     Java 17/21, H2, BCrypt)     │
└─────────────────────────────────┘                                   └─────────────────────────────────┘
                 │                                                                     │
         ┌───────┴───────┐                                                     ┌───────┴───────┐
         ▼               ▼                                                     ▼               ▼
┌────────────────┐ ┌────────────────┐                                   ┌────────────────┐ ┌────────────────┐
│   ATHARVA      │ │    SHREYAS     │                                   │    VEDIKA      │ │   VEDASHREE    │
│  Frontend UI/UX│ │  Full-Stack &  │═══════════[REST / SSL]════════════│ Core OOP Model │ │Hardware Engine │
│ Hardware Sim   │ │  DevOps Lead   │                                   │Banking Domain  │ │Cash Dispenser  │
│ Design System  │ │ Security Vault │                                   │Exceptions & Tx │ │Persistence JPA │
└────────────────┘ └────────────────┘                                   └────────────────┘ └────────────────┘
```

---

## Team Responsibility Matrix

| Member | Primary Role | Core Modules & Code Ownership | Key Deliverables & Documentation |
| :--- | :--- | :--- | :--- |
| **1. Shreyas** *(Lead)* | **Full-Stack Architecture, Security Vault & DevOps** | • Authentication & BCrypt Vault (`PinSecurityService.java`)<br>• Session Lifecycle & Cookies (`AuthController.java`)<br>• Multi-Stage Dockerfile & Free-Tier JVM Optimization<br>• Vercel Edge Proxy (`vercel.json`) & Render Cloud Hosting<br>• End-to-End Automated Test Harness (`test_e2e_live.py`) | [docs/team/1_SHREYAS.md](file:///d:/College/CP/atm_system/docs/team/1_SHREYAS.md)<br>`DEPLOYMENT_GUIDE.md`<br>`test_e2e_live.py` |
| **2. Vedika** | **Core Banking Domain & OOP Architecture** | • Pure Java OOP Architecture (`Account.java`, `SavingsAccount.java`, `CurrentAccount.java`)<br>• Interface Abstraction (`AccountOperations`, `CardOperations`)<br>• Custom Domain Exception Hierarchy (`AtmException`)<br>• Account Management & Transfer Logic (`AccountController.java`)<br>• Business Rules (Minimum ledger balance, card lifecycle) | [docs/team/2_VEDIKA.md](file:///d:/College/CP/atm_system/docs/team/2_VEDIKA.md)<br>`OOP_CONCEPTS.md`<br>`BACKEND.md` (§3) |
| **3. Vedashree** | **Hardware Engine, Cash Dispenser & Persistence Layer** | • Greedy Banknote Allocation Algorithm (`CashDispenserService.java`)<br>• Cassette Inventory Management (₹500, ₹200, ₹100 banknotes)<br>• Spring Data JPA Entities & Repositories (`AccountEntity`, etc.)<br>• Hardware Controller & Health Endpoints (`AtmHardwareController.java`)<br>• Automated Backend JUnit Test Suite (34 unit & flow tests) | [docs/team/3_VEDASHREE.md](file:///d:/College/CP/atm_system/docs/team/3_VEDASHREE.md)<br>`API_DOCUMENTATION.md`<br>`BACKEND.md` (§4-8) |
| **4. Atharva** | **Frontend UI/UX, Hardware Simulation & Design System** | • Touchscreen Kiosk Shell (`AtmKiosk.tsx`, `Header.tsx`, `Sidebar.tsx`)<br>• Physical Hardware Bay (`CardSlot.tsx`, `CashDispenserSlot.tsx`, `ReceiptPrinterSlot.tsx`, `PhysicalKeypad.tsx`)<br>• 3D Interactive Card Engine (`ApexCard.tsx`, 6 visual themes)<br>• Design System, Tokens, Sound Synthesis & Responsive Viewports<br>• 41 Automated Vitest Component Tests | [docs/team/4_ATHARVA.md](file:///d:/College/CP/atm_system/docs/team/4_ATHARVA.md)<br>`FRONTEND.md`<br>`DESIGN_SYSTEM.md` |

---

## Individual Specification Guides

Click each individual document to inspect the detailed responsibility breakdown, code files, architectural diagrams, and viva defense talking points for each team member:

1. 📘 **[Shreyas's Guide — Full-Stack Architecture, Security & DevOps](file:///d:/College/CP/atm_system/docs/team/1_SHREYAS.md)**
2. 📗 **[Vedika's Guide — Core Banking Domain & OOP Architecture](file:///d:/College/CP/atm_system/docs/team/2_VEDIKA.md)**
3. 📙 **[Vedashree's Guide — Hardware Engine, Cash Dispenser & Persistence](file:///d:/College/CP/atm_system/docs/team/3_VEDASHREE.md)**
4. 📕 **[Atharva's Guide — Frontend UI/UX, Hardware Simulation & Design System](file:///d:/College/CP/atm_system/docs/team/4_ATHARVA.md)**
