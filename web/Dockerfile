FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npx nx build web

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist/web /app
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

# Expose the web port
EXPOSE 4200

# Start the application
ENV NODE_ENV=production
CMD ["npm", "start"]
