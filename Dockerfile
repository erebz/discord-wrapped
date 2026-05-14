# Stage 1: Build the TypeScript application
FROM node:20-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Install production dependencies only
FROM node:20-slim AS prod-deps
WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

# Stage 3: Final production image
FROM node:20-slim
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package*.json ./

# Create data directory for SQLite
RUN mkdir -p /app/data

# Default environment variables
ENV DATABASE_URL="file:/app/data/app.db"
ENV NODE_ENV="production"

CMD ["npm", "start"]
