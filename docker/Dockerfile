# =============================================================================
# Multi-stage Dockerfile — Trial Booking System Backend
# =============================================================================
# Stage 1: Builder — compile TypeScript
# Stage 2: Runner — minimal production image
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Build
# ---------------------------------------------------------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=libs/database/prisma/schema.prisma

# Build NestJS application
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: Production runner
# ---------------------------------------------------------------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

# Copy built artifacts from builder
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./
COPY --from=builder --chown=appuser:appgroup /app/libs/database/prisma ./libs/database/prisma

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/trial-classes || exit 1

# Run migrations (optional — can also run via init script) and start
CMD ["sh", "-c", "npx prisma migrate deploy --schema=libs/database/prisma/schema.prisma && node dist/apps/api/main"]
