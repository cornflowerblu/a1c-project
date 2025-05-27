# Database Setup with Prisma

This project uses Prisma ORM with PostgreSQL for database management.

## Prerequisites

- Node.js and npm installed
- PostgreSQL server running
- Database created for the application

## Setup Instructions

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment variables**

Create or update the `.env` file in the `api` directory with your PostgreSQL connection string:

```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

Replace `username`, `password`, and `database_name` with your PostgreSQL credentials.

3. **Generate Prisma client**

```bash
npm run prisma:generate
```

4. **Run migrations**

```bash
npm run prisma:migrate
```

5. **Seed the database (optional)**

If you have a seed script, run:

```bash
npx prisma db seed
```

## Available Scripts

- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Create and apply migrations
- `npm run prisma:deploy` - Apply migrations in production
- `npm run prisma:studio` - Open Prisma Studio to view and edit data

## Database Schema

The database schema includes the following models:

- **User**: Stores user information
- **Run**: Represents experiment runs
- **Reading**: Stores measurement readings

## Working with Prisma

### Using the Prisma Service

The `PrismaService` is available throughout the application as a global provider. Inject it into your services:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class YourService {
  constructor(private prisma: PrismaService) {}

  async findSomething(id: string) {
    return this.prisma.yourModel.findUnique({
      where: { id },
    });
  }
}
```

### Transactions

Use the `executeInTransaction` helper method for transaction handling:

```typescript
await this.prisma.executeInTransaction(async (prisma) => {
  // Operations within transaction
  await prisma.user.create({ data: { /* ... */ } });
  await prisma.run.create({ data: { /* ... */ } });
});
```

## Migrations

### Creating a new migration

When you change the schema, create a new migration:

```bash
npx prisma migrate dev --name your_migration_name
```

### Applying migrations in production

```bash
npx prisma migrate deploy
```

## Troubleshooting

- **Connection issues**: Verify your PostgreSQL server is running and the connection string is correct
- **Migration errors**: Check the Prisma migration history with `npx prisma migrate status`
- **Schema issues**: Validate your schema with `npx prisma validate`