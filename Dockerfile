# Build stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

# Create data directory for SQLite
RUN mkdir -p /app/data

# Default environment variables
ENV DATABASE_URL="file:/app/data/app.db"
ENV NODE_ENV="production"

CMD ["npm", "start"]
