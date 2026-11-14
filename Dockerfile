# ==============================================================================
# Multi-Stage Production Dockerfile for Apex ATM Java Backend
# Target: Render / Railway / Cloud Run / Kubernetes
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build artifact using Maven and Eclipse Temurin 17 JDK
# ------------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and resources
COPY src ./src
COPY resources ./resources

# Package executable Spring Boot fat JAR
RUN mvn clean package -DskipTests

# ------------------------------------------------------------------------------
# Stage 2: Ultra-lightweight production runtime using Eclipse Temurin 17 JRE
# ------------------------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

# Install curl for container health check
RUN apk add --no-cache curl tzdata

# Create dedicated non-root application user for defense-in-depth security
RUN addgroup -S atmgroup && adduser -S atmuser -G atmgroup

# Create directory for persistent embedded H2 database volume
RUN mkdir -p /app/data && chown -R atmuser:atmgroup /app

# Copy compiled JAR from build stage
COPY --from=builder --chown=atmuser:atmgroup /build/target/atm-web-application-1.0.0.jar app.jar

# Switch to non-root user
USER atmuser

# Expose default HTTP port (Render dynamically overrides via $PORT environment variable)
EXPOSE 8080

# Environment variables with sensible production defaults
ENV PORT=8080 \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom" \
    COOKIE_SAME_SITE="none" \
    COOKIE_SECURE="true"

# Healthcheck probe pointing to the zero-dependency health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/atm/health || exit 1

# Launch Spring Boot application
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]

