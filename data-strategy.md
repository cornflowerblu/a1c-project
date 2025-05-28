# Data Strategy for A1C Estimator

## Row-Level Security and Caregiver Access Implementation

This document outlines the strategy for implementing row-level security and caregiver access in the A1C Estimator application.

## Current Database Schema

The current schema includes:
- `User` model with basic user information
- `Run` model for glucose monitoring periods
- `Reading` model for individual glucose readings

## Requirements

1. **Row-Level Security**: Users should only be able to access their own data
2. **Caregiver Access**: Caregivers should have read-only access to data of users who have designated them as caregivers
3. **Data Integrity**: Ensure data cannot be accessed or modified by unauthorized users

## Schema Updates

### Updated Prisma Schema

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
  id                String          @id @default(uuid())
  clerkId           String?         @unique
  email             String          @unique
  name              String?
  role              UserRole        @default(user)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  // Data relationships
  glucoseRuns       Run[]
  glucoseReadings   Reading[]
  
  // Caregiver relationships
  caregivers        CaregiverAccess[] @relation("PatientCaregivers")
  caregivingFor     CaregiverAccess[] @relation("CaregiverPatients")
}

enum UserRole {
  admin
  user
  caregiver
}

model CaregiverAccess {
  id              String    @id @default(uuid())
  patientId       String
  caregiverId     String
  status          AccessStatus @default(pending)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  patient         User      @relation("PatientCaregivers", fields: [patientId], references: [id])
  caregiver       User      @relation("CaregiverPatients", fields: [caregiverId], references: [id])
  
  // Unique constraint to prevent duplicate relationships
  @@unique([patientId, caregiverId])
}

enum AccessStatus {
  pending
  active
  revoked
}

model Run {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  startDate       DateTime
  endDate         DateTime?
  glucoseReadings Reading[]
  estimatedA1C    Float?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Reading {
  id              String    @id @default(uuid())
  glucoseRunId    String
  glucoseRun      Run       @relation(fields: [glucoseRunId], references: [id])
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  glucoseValue    Float
  timestamp       DateTime
  mealContext     String?   // Before meal, After meal, Fasting, etc.
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

## Implementation Strategy

### 1. Database Layer

#### Caregiver Relationship Model

The `CaregiverAccess` model establishes a many-to-many relationship between users:
- A user can have multiple caregivers
- A caregiver can care for multiple patients
- The relationship includes a status field to manage the relationship lifecycle

#### Row-Level Security Implementation

1. **Direct Database Access**:
   - For PostgreSQL, implement Row-Level Security (RLS) policies:
   ```sql
   -- Enable RLS on tables
   ALTER TABLE "Run" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "Reading" ENABLE ROW LEVEL SECURITY;
   
   -- Create policies for users to see only their own data
   CREATE POLICY user_run_policy ON "Run" 
     USING (userId = current_setting('app.current_user_id')::uuid);
   
   CREATE POLICY user_reading_policy ON "Reading" 
     USING (userId = current_setting('app.current_user_id')::uuid);
   ```

2. **Application-Level Security**:
   - Implement middleware in NestJS to enforce access control
   - Filter queries based on user ID and caregiver relationships

### 2. API Layer Security

#### NestJS Guards and Interceptors

1. **Authentication Guard**:
   - Verify user identity using Clerk authentication
   - Extract user ID and role from the authenticated session

2. **Authorization Guard**:
   - Check if the user has permission to access the requested resource
   - Implement specific guards for caregiver access

3. **Data Access Interceptor**:
   - Automatically filter data based on user permissions
   - Add user context to all database queries

#### Example Implementation

```typescript
// auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.headers['authorization']?.split(' ')[1];
    
    if (!sessionId) {
      throw new UnauthorizedException();
    }
    
    const user = await this.authService.validateSession(sessionId);
    if (!user) {
      throw new UnauthorizedException();
    }
    
    request.user = user;
    return true;
  }
}

// data-access.interceptor.ts
@Injectable()
export class DataAccessInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Set user context for all database queries
    this.prisma.$use(async (params, next) => {
      // Apply filters based on user role and relationships
      if (params.model === 'Run' || params.model === 'Reading') {
        if (params.action === 'findMany' || params.action === 'findFirst' || params.action === 'findUnique') {
          // For regular users, only show their own data
          if (user.role === 'user') {
            params.args.where = {
              ...params.args.where,
              userId: user.id,
            };
          }
          
          // For caregivers, show their own data + data of patients they care for
          if (user.role === 'caregiver') {
            const caregivingForIds = await this.getCaregivingPatientIds(user.id);
            
            params.args.where = {
              ...params.args.where,
              OR: [
                { userId: user.id },
                { userId: { in: caregivingForIds } }
              ]
            };
          }
        }
      }
      
      return next(params);
    });
    
    return next.handle();
  }
  
  private async getCaregivingPatientIds(caregiverId: string): Promise<string[]> {
    const relationships = await this.prisma.caregiverAccess.findMany({
      where: {
        caregiverId,
        status: 'active',
      },
      select: {
        patientId: true,
      },
    });
    
    return relationships.map(rel => rel.patientId);
  }
}
```

### 3. Service Layer Implementation

#### User Service

```typescript
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  
  // Caregiver management
  async requestCaregiverAccess(patientEmail: string, caregiverId: string) {
    const patient = await this.prisma.user.findUnique({
      where: { email: patientEmail },
    });
    
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    
    return this.prisma.caregiverAccess.create({
      data: {
        patientId: patient.id,
        caregiverId,
        status: 'pending',
      },
    });
  }
  
  async approveCaregiverRequest(requestId: string, patientId: string) {
    const request = await this.prisma.caregiverAccess.findUnique({
      where: { id: requestId },
    });
    
    if (!request || request.patientId !== patientId) {
      throw new NotFoundException('Request not found');
    }
    
    return this.prisma.caregiverAccess.update({
      where: { id: requestId },
      data: { status: 'active' },
    });
  }
  
  async revokeCaregiverAccess(requestId: string, patientId: string) {
    const request = await this.prisma.caregiverAccess.findUnique({
      where: { id: requestId },
    });
    
    if (!request || request.patientId !== patientId) {
      throw new NotFoundException('Request not found');
    }
    
    return this.prisma.caregiverAccess.update({
      where: { id: requestId },
      data: { status: 'revoked' },
    });
  }
  
  // Get patients for a caregiver
  async getCaregivingPatients(caregiverId: string) {
    const relationships = await this.prisma.caregiverAccess.findMany({
      where: {
        caregiverId,
        status: 'active',
      },
      include: {
        patient: true,
      },
    });
    
    return relationships.map(rel => rel.patient);
  }
  
  // Get caregivers for a patient
  async getPatientCaregivers(patientId: string) {
    const relationships = await this.prisma.caregiverAccess.findMany({
      where: {
        patientId,
        status: 'active',
      },
      include: {
        caregiver: true,
      },
    });
    
    return relationships.map(rel => rel.caregiver);
  }
}
```

#### Run and Reading Services

```typescript
@Injectable()
export class RunsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}
  
  async findAll(userId: string) {
    // Get user role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    
    if (user.role === 'caregiver') {
      // Get patients this caregiver has access to
      const patients = await this.usersService.getCaregivingPatients(userId);
      const patientIds = patients.map(p => p.id);
      
      // Return runs for all patients + caregiver's own runs
      return this.prisma.run.findMany({
        where: {
          userId: {
            in: [...patientIds, userId],
          },
        },
        include: { glucoseReadings: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Regular user - only return their own runs
      return this.prisma.run.findMany({
        where: { userId },
        include: { glucoseReadings: true },
        orderBy: { createdAt: 'desc' },
      });
    }
  }
  
  async findOne(id: string, userId: string) {
    const run = await this.prisma.run.findUnique({
      where: { id },
      include: { glucoseReadings: true },
    });
    
    if (!run) {
      throw new NotFoundException('Run not found');
    }
    
    // Check if user has access to this run
    const hasAccess = await this.checkUserAccess(userId, run.userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this run');
    }
    
    return run;
  }
  
  // Helper method to check if a user has access to another user's data
  private async checkUserAccess(userId: string, targetUserId: string): Promise<boolean> {
    // If it's the user's own data, allow access
    if (userId === targetUserId) {
      return true;
    }
    
    // Check if user is a caregiver for the target user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    
    if (user.role === 'caregiver') {
      const caregiverAccess = await this.prisma.caregiverAccess.findFirst({
        where: {
          caregiverId: userId,
          patientId: targetUserId,
          status: 'active',
        },
      });
      
      return !!caregiverAccess;
    }
    
    // Admin can access all data
    if (user.role === 'admin') {
      return true;
    }
    
    return false;
  }
  
  // Other CRUD methods with similar access checks...
}
```

### 4. Frontend Implementation

#### React Context for User Permissions

```typescript
// permissions-context.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import { api } from '../api/users';

interface PermissionsContextType {
  isCaregiverFor: (userId: string) => boolean;
  caregivingPatients: any[];
  caregivers: any[];
  loadingPermissions: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const [caregivingPatients, setCaregivingPatients] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  
  useEffect(() => {
    if (isLoggedIn && user) {
      const loadPermissions = async () => {
        try {
          // Load caregiver relationships
          if (user.role === 'caregiver') {
            const patients = await api.getCaregivingPatients();
            setCaregivingPatients(patients);
          }
          
          // Load patient's caregivers
          const userCaregivers = await api.getPatientCaregivers();
          setCaregivers(userCaregivers);
          
          setLoadingPermissions(false);
        } catch (error) {
          console.error('Failed to load permissions:', error);
          setLoadingPermissions(false);
        }
      };
      
      loadPermissions();
    }
  }, [isLoggedIn, user]);
  
  const isCaregiverFor = (userId: string): boolean => {
    return caregivingPatients.some(patient => patient.id === userId);
  };
  
  return (
    <PermissionsContext.Provider value={{
      isCaregiverFor,
      caregivingPatients,
      caregivers,
      loadingPermissions,
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
```

#### Caregiver Management UI Components

```tsx
// components/caregiver-management.tsx
import React, { useState } from 'react';
import { usePermissions } from '../context/permissions-context';
import { api } from '../api/users';

export const CaregiverManagement: React.FC = () => {
  const { caregivers } = usePermissions();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleAddCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.requestCaregiverAccess(email);
      setSuccess(`Caregiver request sent to ${email}`);
      setEmail('');
    } catch (err) {
      setError('Failed to send caregiver request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRevokeAccess = async (caregiverId: string) => {
    setLoading(true);
    
    try {
      await api.revokeCaregiverAccess(caregiverId);
      // Refresh the caregivers list
      window.location.reload();
    } catch (err) {
      setError('Failed to revoke access');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Caregiver Management</h2>
      
      {/* Add Caregiver Form */}
      <form onSubmit={handleAddCaregiver} className="mb-6">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Caregiver Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter caregiver's email"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Add Caregiver'}
        </button>
        
        {error && <p className="mt-2 text-red-600">{error}</p>}
        {success && <p className="mt-2 text-green-600">{success}</p>}
      </form>
      
      {/* Current Caregivers List */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Current Caregivers</h3>
        
        {caregivers.length === 0 ? (
          <p className="text-gray-500">You haven't added any caregivers yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {caregivers.map((caregiver) => (
              <li key={caregiver.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{caregiver.name}</p>
                  <p className="text-sm text-gray-500">{caregiver.email}</p>
                </div>
                <button
                  onClick={() => handleRevokeAccess(caregiver.id)}
                  className="text-red-600 hover:text-red-800"
                  disabled={loading}
                >
                  Revoke Access
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
```

#### Patient Selection for Caregivers

```tsx
// components/patient-selector.tsx
import React from 'react';
import { usePermissions } from '../context/permissions-context';
import { useRouter } from 'next/router';

export const PatientSelector: React.FC = () => {
  const { caregivingPatients, loadingPermissions } = usePermissions();
  const router = useRouter();
  
  if (loadingPermissions) {
    return <div>Loading patients...</div>;
  }
  
  if (caregivingPatients.length === 0) {
    return <div>You are not a caregiver for any patients.</div>;
  }
  
  const handlePatientSelect = (patientId: string) => {
    router.push(`/patient/${patientId}/dashboard`);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Your Patients</h2>
      
      <ul className="divide-y divide-gray-200">
        {caregivingPatients.map((patient) => (
          <li 
            key={patient.id} 
            className="py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
            onClick={() => handlePatientSelect(patient.id)}
          >
            <div>
              <p className="font-medium">{patient.name}</p>
              <p className="text-sm text-gray-500">{patient.email}</p>
            </div>
            <button className="text-blue-600 hover:text-blue-800">
              View Data
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

## Migration Strategy

1. **Schema Migration**:
   - Create a new migration to add the `CaregiverAccess` model
   - Update existing models with new relationships

2. **Data Migration**:
   - No data migration needed for new installations
   - For existing installations, ensure user roles are properly set

3. **API Updates**:
   - Implement new endpoints for caregiver management
   - Update existing endpoints to respect row-level security

4. **Frontend Updates**:
   - Add caregiver management UI
   - Update data fetching to handle caregiver access

## Security Considerations

1. **Audit Logging**:
   - Log all data access, especially when a caregiver accesses patient data
   - Include timestamp, user ID, action, and resource accessed

2. **Consent Management**:
   - Ensure patients explicitly approve caregiver access
   - Provide clear UI for managing and revoking access

3. **Read-Only Access**:
   - Ensure caregivers cannot modify patient data
   - Implement separate permission checks for read vs. write operations

4. **Data Minimization**:
   - Only expose necessary data to caregivers
   - Consider implementing field-level permissions if needed

## Testing Strategy

1. **Unit Tests**:
   - Test permission logic in isolation
   - Verify caregiver relationship management

2. **Integration Tests**:
   - Test API endpoints with different user roles
   - Verify row-level security is enforced

3. **End-to-End Tests**:
   - Test complete caregiver workflows
   - Verify data visibility across different user accounts

## Conclusion

This implementation strategy provides a comprehensive approach to row-level security and caregiver access in the A1C Estimator application. By combining database-level security, application-level authorization, and a clear user interface for managing relationships, we can ensure that user data remains secure while enabling the valuable caregiver functionality.
