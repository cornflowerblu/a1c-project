FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npx nx build api

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist/api /app
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/prisma /app/prisma

# Expose the API port
EXPOSE 3333

# Start the application
CMD ["node", "main.js"]
