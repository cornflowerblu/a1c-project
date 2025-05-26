# A1C Estimator MVP Implementation Plan

## Project Overview
This implementation plan outlines the steps to build the A1C Estimator application using a monorepo architecture with NestJS for the backend API, Next.js for the frontend, and PostgreSQL database.

## Technology Stack

### Frontend
- **Framework**: Next.js
- **UI Components**: React
- **Styling**: CSS (with option to use Tailwind CSS or styled-components)
- **State Management**: React Context API or Redux (if needed for complex state)

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT-based authentication with Passport.js
- **Hosting**: Vercel for frontend, AWS (EC2, ECS) for backend API

## Database Schema (Prisma)

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  glucoseRuns   Run[]
}

model Run {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  startDate     DateTime
  endDate       DateTime?
  readings      Reading[]
  estimatedA1C  Float?
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Reading {
  id            String    @id @default(uuid())
  runId         String
  run           Run       @relation(fields: [runId], references: [id])
  glucoseValue  Float
  timestamp     DateTime
  mealContext   String?   // Before meal, After meal, Fasting, etc.
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## Monorepo Project Structure

```
a1c-project/
├── api/                  # NestJS backend API
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── users/    # Users module
│   │   │   ├── runs/     # Glucose runs module
│   │   │   └── readings/ # Glucose readings module
│   │   └── main.ts       # API entry point
├── web/                  # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   │   ├── api/      # API client functions
│   │   │   ├── components/
│   │   │   │   ├── layout/ # Layout components
│   │   │   │   ├── forms/  # Form components
│   │   │   │   └── ui/     # UI elements
│   │   │   ├── context/  # React context providers
│   │   │   ├── estimator/ # A1C Estimator tool
│   │   │   ├── instructions/ # Instructions page
│   │   │   ├── contact/  # Contact page
│   │   │   └── page.tsx  # Home page
│   ├── public/           # Static assets
│   └── next.config.js    # Next.js configuration
├── shared/               # Shared libraries
│   ├── api-interfaces/   # Shared API interfaces
│   ├── auth/             # Authentication utilities
│   └── a1c-calculator/   # A1C calculation algorithm
├── prisma/               # Prisma configuration
│   └── schema.prisma     # Database schema
└── nx.json               # Nx monorepo configuration
```

## Authentication Implementation (JWT with NestJS)

1. **Setup NestJS Authentication**
   - Implement JWT-based authentication with Passport.js
   - Configure JWT secret and token expiration
   - Create authentication guards for protected routes
   - Implement password hashing with bcrypt

2. **Integration with Next.js Frontend**
   - Create authentication context in React
   - Implement authentication hooks for sign-in, sign-up, and sign-out
   - Store JWT token securely in browser storage
   - Implement protected routes using React context

3. **Authentication Components**
   - Create login form component
   - Create registration form component
   - Create password reset components
   - Implement authentication state management

## Core Features Implementation

### User Management
1. **User Registration and Login**
   - Implement registration form with email verification
   - Create login functionality using AWS Cognito
   - Add password reset functionality

2. **User Profile**
   - Allow users to view and edit their profile information
   - Store diabetes-related information

### A1C Estimation Features
1. **Glucose Reading Entry**
   - Create forms for entering glucose readings
   - Implement validation for glucose values
   - Allow users to add context to readings (before/after meals, etc.)

2. **Run Management**
   - Implement the concept of "runs" for tracking glucose readings
   - Allow users to create, view, edit, and delete runs
   - Calculate statistics for each run

3. **A1C Estimation Algorithm**
   - Port the existing A1C estimation algorithm from the original codebase
   - Implement the calculation logic in a utility function
   - Store calculation results in the database

4. **Data Visualization**
   - Use a charting library (Chart.js, D3.js, or Recharts)
   - Create charts to visualize glucose trends
   - Show estimated A1C over time

### Additional Features
1. **Data Export**
   - Allow users to export their data in various formats (CSV, PDF)
   - Generate reports that can be shared with healthcare providers

2. **Reminders and Notifications**
   - Implement optional reminders for glucose testing
   - Send email notifications for important events

## API Routes (NestJS)

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login existing user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/forgot-password` - Initiate password reset
- `POST /api/auth/reset-password` - Complete password reset

### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Glucose Management
- `GET /api/runs` - Get all runs for the user
- `POST /api/runs` - Create a new run
- `GET /api/runs/:id` - Get a specific run
- `PUT /api/runs/:id` - Update a run
- `DELETE /api/runs/:id` - Delete a run
- `POST /api/runs/:id/readings` - Add a reading to a run
- `GET /api/runs/:id/readings` - Get all readings for a run
- `PUT /api/readings/:id` - Update a reading
- `DELETE /api/readings/:id` - Delete a reading
- `GET /api/runs/:id/estimate` - Calculate A1C estimate for a run

## Page Implementation

### Home Page (`/`)
- Introduction to the A1C Estimator
- Features overview
- Call-to-action for registration/login
- Testimonials or success stories (if available)

### Estimator Page (`/estimator`)
- A1C estimation tool
- Form for entering glucose readings
- Results display
- Historical data visualization
- Export options

### Instructions Page (`/instructions`)
- Detailed usage instructions
- Educational content about A1C
- FAQ section

### Contact Page (`/contact`)
- Contact form
- Support information
- Links to resources

## Technical Implementation Details

### Monorepo Setup with Nx
1. Create a new Nx workspace:
   ```bash
   npx create-nx-workspace@latest a1c-project
   cd a1c-project
   ```

2. Add NestJS and Next.js applications:
   ```bash
   npx nx g @nx/nest:app api
   npx nx g @nx/next:app web
   ```

3. Install necessary dependencies:
   ```bash
   npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local bcrypt prisma @prisma/client axios react-hook-form
   ```

### Prisma Setup
1. Initialize Prisma:
   ```bash
   npx prisma init
   ```

2. Configure database connection in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/a1cestimate"
   ```

3. Create the schema as defined above and run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

### NestJS Authentication Setup
1. Configure JWT in NestJS:
   ```typescript
   // api/src/app/auth/auth.module.ts
   import { Module } from '@nestjs/common';
   import { JwtModule } from '@nestjs/jwt';
   import { PassportModule } from '@nestjs/passport';
   import { AuthService } from './auth.service';
   import { AuthController } from './auth.controller';
   import { JwtStrategy } from './strategies/jwt.strategy';
   import { UsersModule } from '../users/users.module';

   @Module({
     imports: [
       UsersModule,
       PassportModule,
       JwtModule.register({
         secret: process.env.JWT_SECRET,
         signOptions: { expiresIn: '1d' },
       }),
     ],
     providers: [AuthService, JwtStrategy],
     controllers: [AuthController],
     exports: [AuthService],
   })
   export class AuthModule {}
   ```

2. Create authentication service:
   ```typescript
   // api/src/app/auth/auth.service.ts
   import { Injectable } from '@nestjs/common';
   import { JwtService } from '@nestjs/jwt';
   import { UsersService } from '../users/users.service';
   import * as bcrypt from 'bcrypt';

   @Injectable()
   export class AuthService {
     constructor(
       private usersService: UsersService,
       private jwtService: JwtService,
     ) {}

     async validateUser(email: string, password: string): Promise<any> {
       const user = await this.usersService.findByEmail(email);
       if (user && await bcrypt.compare(password, user.password)) {
         const { password, ...result } = user;
         return result;
       }
       return null;
     }

     async login(user: any) {
       const payload = { email: user.email, sub: user.id };
       return {
         user,
         token: this.jwtService.sign(payload),
       };
     }
   }
   ```

### Database Access in NestJS
1. Create a Prisma service:
   ```typescript
   // api/src/prisma/prisma.service.ts
   import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
   import { PrismaClient } from '@prisma/client';

   @Injectable()
   export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
     constructor() {
       super({
         log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
       });
     }

     async onModuleInit() {
       await this.$connect();
     }

     async onModuleDestroy() {
       await this.$disconnect();
     }
   }
   ```

2. Use in NestJS services:
   ```typescript
   // api/src/app/runs/runs.service.ts
   import { Injectable } from '@nestjs/common';
   import { PrismaService } from '../../prisma/prisma.service';

   @Injectable()
   export class RunsService {
     constructor(private prisma: PrismaService) {}

     async findAll(userId: string) {
       return this.prisma.run.findMany({
         where: { userId },
         include: { readings: true },
         orderBy: { createdAt: 'desc' },
       });
     }
     
     // Other CRUD methods...
   }
   ```

## Implementation Phases

### Phase 1: Project Setup and Authentication
1. Set up Nx monorepo with NestJS and Next.js
2. Configure Prisma with PostgreSQL
3. Implement JWT authentication in NestJS
4. Create basic user management features

### Phase 2: Core Functionality
1. Implement database models and migrations
2. Create NestJS controllers and services for glucose readings and runs
3. Port the A1C estimation algorithm to shared library
4. Develop the basic UI components in Next.js

### Phase 3: Enhanced Features
1. Add data visualization components
2. Implement data export functionality
3. Create user dashboard with insights
4. Add reminders and notifications

### Phase 4: Testing and Deployment
1. Write unit and integration tests
2. Perform security audits
3. Set up CI/CD pipeline
4. Deploy to production environment

## Security Considerations
1. Implement proper authentication and authorization
2. Secure API routes with appropriate middleware
3. Validate all user inputs
4. Encrypt sensitive data in the database
5. Implement HTTPS for all communications
6. Follow HIPAA guidelines for handling health data

## Performance Considerations
1. Optimize database queries with proper indexing
2. Implement caching for frequently accessed data
3. Use Next.js static and server-side rendering appropriately
4. Optimize frontend assets for faster loading

## Testing Strategy
1. Unit tests for utility functions and components
2. Integration tests for API routes
3. End-to-end tests for critical user flows
4. Authentication flow testing

## Deployment Considerations
1. Set up CI/CD pipeline (GitHub Actions, CircleCI, etc.)
2. Configure production database
3. Set up proper logging and monitoring
4. Implement database backup strategy
5. Configure JWT secrets and token management for production
6. Deploy NestJS backend to AWS (EC2, ECS, or EKS)
7. Deploy Next.js frontend to Vercel or AWS
