# Team Member 1: Shreyas — Full-Stack Architecture, Security Vault & DevOps

> **Name**: Shreyas (Team Lead)  
> **Role Title**: Full-Stack Architect, Security Engineer & Cloud DevOps Specialist  
> **Core Focus**: Client-Server Integration, BCrypt Cryptographic Vault, Production Containerization, Edge Proxies & E2E Validation  
> **Key Code Locations**: `src/com/bank/atm/security/`, `src/com/bank/atm/controller/AuthController.java`, `Dockerfile`, `frontend/vercel.json`, `test_e2e_live.py`

---

## 1. Executive Summary & Contributions

Shreyas is the architect responsible for connecting the physical ATM frontend simulation with the enterprise Java Spring Boot backend, designing the cryptographic security vault, containerizing the backend for cloud execution, and establishing the automated continuous deployment pipeline.

### Core Areas of Ownership:
1. **Full-Stack Orchestration**: Designed the RESTful API communication bridge, ensuring transactional integrity, proper HTTP status codes, and cross-origin security.
2. **Security & Cryptography**: Implemented industry-standard 10-round salted BCrypt password hashing for PINs, a brute-force card lockout machine, and secure HTTP-only session cookies.
3. **Cloud Infrastructure & DevOps**: Authored the multi-stage Dockerfile, optimized the JVM runtime for micro-CPU cloud tiers, and configured Vercel edge reverse proxies to eliminate third-party cookie restrictions.
4. **End-to-End System Testing**: Authored the 17-point automated integration test suite (`test_e2e_live.py`) verifying live cloud deployment health.

---

## 2. Detailed Technical Modules

### A. BCrypt Cryptographic Security Vault (`PinSecurityService.java`)
- **Zero Plain-Text Storage**: Card PINs are never stored in plain text anywhere in memory or the database.
- **BCrypt Hashing with Salt**:
  ```java
  public String hashPin(String rawPin) {
      return passwordEncoder.encode(rawPin); // 10 rounds of salt
  }
  public boolean verifyPin(String rawPin, String hashedPin) {
      return passwordEncoder.matches(rawPin, hashedPin);
  }
  ```
- **Brute Force Defense**: If a user enters an incorrect PIN 3 consecutive times, the security state machine sets `card.setBlocked(true)` and commits the lock to the database. All subsequent requests return `403 Forbidden`.
- **Remote Operator Recovery**: Implemented `POST /api/atm/unblock?cardNumber=...` allowing authorized administrators to reset failed attempts and restore access.

### B. Session Lifecycle & Cookie Security (`AuthController.java`)
- Managed session state using Spring HTTP Sessions identified by `JSESSIONID`.
- Injected `SameSite=None; Secure; HttpOnly` attributes into production cookies so cross-site requests over HTTPS can transmit authentication tokens safely.

### C. Containerization & Free-Tier Optimization (`Dockerfile`)
- Engineered a lightweight multi-stage Docker container:
  - **Stage 1 (Builder)**: `maven:3.9.9-eclipse-temurin-17-alpine` packages the executable fat JAR.
  - **Stage 2 (Runner)**: `eclipse-temurin:17-jre-alpine` non-root execution (`atmuser`).
- **Startup Optimization**: Render's free tier provides 0.1 CPU, causing standard Spring Boot to take ~92s to start. Shreyas optimized the JVM flags:
  ```dockerfile
  ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -Djava.security.egd=file:/dev/./urandom"
  ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=${PORT:-10000} -Dserver.address=0.0.0.0 -jar app.jar"]
  ```
  This reduced bootstrap latency from **92 seconds down to 15 seconds**, ensuring Render's port scanner detects the open socket immediately.

### D. Edge Reverse Proxy Routing (`frontend/vercel.json`)
- Addressed cross-origin cookie rejection on strict browsers (Safari, Chrome Incognito):
  ```json
  {
    "rewrites": [
      {
        "source": "/api/(.*)",
        "destination": "https://atm-system-dz11.onrender.com/api/$1"
      },
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
  Vercel's edge network proxies `/api/*` requests directly to Render, making all requests appear same-origin to the browser.

---

## 3. Code Files Owned

- `src/com/bank/atm/security/PinSecurityService.java`
- `src/com/bank/atm/controller/AuthController.java`
- `src/com/bank/atm/config/WebMvcConfig.java`
- `Dockerfile`
- `frontend/vercel.json`
- `frontend/.env.production`
- `test_e2e_live.py`
- `DEPLOYMENT_GUIDE.md`

---

## 4. Viva & Presentation Talking Points

1. **Why is BCrypt preferred over SHA-256 or MD5 for PINs?**  
   *Answer*: BCrypt incorporates an adaptive work factor (10 salt rounds) and generates unique random salts per entry, rendering precomputed rainbow tables completely useless and dramatically slowing down offline dictionary brute-force attacks.
2. **Why was a reverse proxy necessary on Vercel?**  
   *Answer*: Modern browsers (especially Safari with ITP and Chrome Incognito) block third-party cookies by default. Proxying `/api/*` through Vercel's edge CDN gives the appearance of a first-party request, ensuring the `JSESSIONID` cookie is preserved without browser rejection.
3. **How did you solve Render's initial 16-minute deployment timeout?**  
   *Answer*: Removed the conflicting Dockerfile `HEALTHCHECK` that was killing the container before the 90s Java bootstrap finished, added `-XX:+TieredCompilation -XX:TieredStopAtLevel=1` to cut startup to 15s, and bound `-Dserver.address=0.0.0.0` directly to Render's `$PORT`.
