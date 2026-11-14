# APEX Touch Banking — Production Deployment Guide

This guide provides end-to-end, production-ready instructions for deploying the **APEX ATM Simulation System** across cloud platforms:
- **Frontend**: [Vercel](https://vercel.com) (React, Vite, TypeScript, Tailwind CSS)
- **Backend**: [Render](https://render.com) (Java 17, Spring Boot, Multi-stage Docker)

---

## 1. System Architecture

```
                    ┌───────────────────────────────┐
                    │      Client Web Browser       │
                    └───────────────┬───────────────┘
                                    │
               HTTPS Requests       │      HTTPS API (CORS + Cookies)
          ┌─────────────────────────┴────────────────────────┐
          ▼                                                  ▼
┌───────────────────────┐                          ┌───────────────────────┐
│   Vercel Edge (CDN)   │                          │    Render Container   │
│  React 19 + Vite SPA  │                          │  Spring Boot / Docker │
│  https://*.vercel.app │                          │  https://*.onrender   │
└───────────────────────┘                          └───────────┬───────────┘
                                                               │
                                                   ┌───────────┴───────────┐
                                                   │ Persistent Disk Vol   │
                                                   │ /app/data/atm_db.mv.db│
                                                   └───────────────────────┘
```

---

## 2. Java Backend Deployment on Render (Docker)

Render supports deploying containerized applications directly from GitHub using the repository's `Dockerfile`.

### Step 2.1: Create Web Service on Render
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** &rarr; **Web Service**.
3. Connect your GitHub repository: `https://github.com/shini21/atm_system.git`.
4. Select the working branch: `feature/premium-atm` (or `main`).
5. Configure the service parameters:
   - **Name**: `apex-atm-backend` (or your chosen name)
   - **Region**: Choose the region closest to your users (e.g., `Singapore`, `Frankfurt`, `Oregon`)
   - **Language / Runtime**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `.`
   - **Instance Type**: `Free` or `Starter`

### Step 2.2: Configure Environment Variables on Render
Navigate to the **Environment** tab in your Render Web Service settings and add the following variables:

| Key | Value | Description |
|---|---|---|
| `PORT` | `10000` *(Render sets this automatically)* | Dynamic port assigned by Render |
| `CORS_ALLOWED_ORIGINS` | `https://*.vercel.app,https://your-custom-domain.com` | Comma-separated list of frontend domains permitted to access the API |
| `COOKIE_SAME_SITE` | `none` | **Mandatory** for cross-origin HTTPS session cookies |
| `COOKIE_SECURE` | `true` | **Mandatory** when `SameSite=none` over HTTPS |
| `JAVA_OPTS` | `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0` | Memory management for Linux containers |

### Step 2.3: Configure Health Check Probe
Under **Advanced Settings** on Render:
- **Health Check Path**: `/api/atm/health`
*(The backend returns HTTP 200 OK with `{"status":"UP","service":"apex-atm-backend"}`)*

### Step 2.4: (Optional) Attach Persistent Disk for Ledger Storage
To preserve bank transactions, card unblock events, and account balances across container redeploys:
1. Navigate to **Disks** in your Render service settings.
2. Click **Add Disk**:
   - **Name**: `atm-data`
   - **Mount Path**: `/app/data`
   - **Size**: `1 GB` (standard free tier)

### Step 2.5: Deploy and Retrieve Service URL
Click **Create Web Service**. Once the build finishes, copy your Render service URL:
`https://apex-atm-backend.onrender.com`

Verify the deployment in your browser or terminal:
```bash
curl https://apex-atm-backend.onrender.com/api/atm/health
# Response: {"status":"UP","service":"apex-atm-backend","timestamp":"...","version":"1.0.0"}
```

---

## 3. Frontend Deployment on Vercel

Vercel provides zero-configuration hosting for Vite SPAs with global CDN distribution.

### Step 3.1: Import Project into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** &rarr; **Project**.
3. Import your GitHub repository: `atm_system`.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3.2: Configure Frontend Environment Variables
In the **Environment Variables** section:

| Key | Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://apex-atm-backend.onrender.com/api` | Full URL to your Render backend API |

> [!IMPORTANT]
> Ensure there is **no trailing slash** after `/api`. Example: `https://apex-atm-backend.onrender.com/api`.

### Step 3.3: Deploy
1. Click **Deploy**.
2. Vercel will install dependencies, compile the TypeScript bundle with Vite, and distribute the site globally.
3. The included `frontend/vercel.json` automatically ensures client-side routing rewrites (`/*` &rarr; `/index.html`) so refreshing on `/withdraw`, `/deposit`, or `/dashboard` loads seamlessly without 404s.

---

## 4. Cross-Origin HTTPS Cookie Authentication

Because the frontend (`https://*.vercel.app`) and backend (`https://*.onrender.com`) reside on separate top-level domains, modern web browsers enforce strict third-party cookie partitioning.

The application is pre-configured to handle this securely:
1. **Frontend Axios Client** (`frontend/src/services/api.ts`):
   ```typescript
   withCredentials: true
   ```
2. **Backend Spring Boot Configuration** (`resources/application.properties`):
   ```properties
   server.servlet.session.cookie.same-site=${COOKIE_SAME_SITE:lax}
   server.servlet.session.cookie.secure=${COOKIE_SECURE:false}
   server.servlet.session.cookie.http-only=true
   ```
3. **CORS Headers** (`src/com/bank/atm/config/WebMvcConfig.java`):
   ```java
   registry.addMapping("/**")
       .allowedOriginPatterns(patterns)
       .allowCredentials(true)
       .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD");
   ```

When `COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true` are active on Render, the browser safely stores and transmits the `JSESSIONID` cookie across every transaction request.

---

## 5. Local Full-Stack Development

To run the entire system locally without Docker or cloud accounts:

### Terminal 1: Java Backend
```bash
# Compile and start Spring Boot on port 8080
./mvnw clean spring-boot:run
```

### Terminal 2: React Frontend
```bash
# Start Vite development server with hot module reloading
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173/` in your browser. All API requests to `/api/*` are automatically proxied to `http://localhost:8080` via Vite's development proxy.

---

## 6. Pre-Configured Classroom Test Cards

| Card Number | PIN | Customer Name | Account Type | Available Balance | Test Scenario |
|---|---|---|---|---|---|
| `CARD1001` | `1234` | Aarav Sharma | Savings | ₹5,000.00 | Standard balance, cash withdrawal, deposit |
| `CARD1002` | `5678` | Priya Patel | Current | ₹12,000.00 | High balance, business transfers |
| `CARD1003` | `4321` | Rahul Verma | Savings | ₹800.00 | **Expired Card** validation test |
| `CARD1004` | `9999` | Neha Iyer | Savings | ₹1,500.00 | **Blocked Card** security audit |
| `CARD1005` | `2468` | Vikram Malhotra | Savings | ₹150.00 | **Low Balance** minimum balance limit check |

