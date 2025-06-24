FROM node:23-alpine AS builder
# create app directory
WORKDIR /app
# Install Python and build tools for native module compilation
RUN apk update && apk upgrade
RUN apk add --no-cache python3 make g++
# Copy package files first for better layer caching
COPY backend/package.json backend/package-lock.json ./
# Install dependencies
RUN npm ci
# Copy the rest of the application
COPY backend/ .
# Build TypeScript to JavaScript
RUN npm run build


# Stage 2: Production image
# ==========================================
FROM node:23-alpine
WORKDIR /app
# Install production dependencies only
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY backend/.env .
# Expose the port your Fastify app listens on (adjust if needed)
EXPOSE 4242

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
CMD wget --no-verbose --tries=1 --spider http://localhost:4242/health || exit 1
# Run the application
CMD ["node", "dist/index.js"]
