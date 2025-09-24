# Multi-stage Dockerfile for SAANSE Platform
# Stage 1: Build stage for dependencies and compilation
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache python3 make g++ libc6-compat

# Copy package files first for better caching
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./
COPY drizzle.config.ts ./

# Install all dependencies (production + development for build)
RUN npm ci --ignore-scripts

# Copy source code
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY migrations/ ./migrations/

# Build the application
RUN npm run build

# Stage 2: Production runtime stage
FROM node:18-alpine AS runtime

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S saanse -u 1001

# Set working directory
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=saanse:nodejs /app/dist ./dist
COPY --from=builder --chown=saanse:nodejs /app/migrations ./migrations
COPY --from=builder --chown=saanse:nodejs /app/shared ./shared

# Copy necessary config files
COPY --chown=saanse:nodejs drizzle.config.ts ./

# Create logs directory
RUN mkdir -p /app/logs && chown saanse:nodejs /app/logs

# Switch to non-root user
USER saanse

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/index.js"]
