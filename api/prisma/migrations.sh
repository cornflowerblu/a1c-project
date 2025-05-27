#!/bin/bash

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Create migration
echo "Creating migration..."
npx prisma migrate dev --name init

# Apply migration
echo "Applying migration..."
npx prisma migrate deploy

echo "Migration completed successfully!"