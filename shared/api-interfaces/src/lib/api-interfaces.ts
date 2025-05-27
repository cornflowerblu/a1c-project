/**
 * Common interfaces for API communication
 */

// User interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// Authentication interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// API response interfaces
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

// Example data interfaces
export interface Message {
  message: string;
}

// Glucose Reading interfaces
export enum MealContext {
  BEFORE_MEAL = 'Before meal',
  AFTER_MEAL = 'After meal',
  FASTING = 'Fasting',
  BEDTIME = 'Bedtime',
  OTHER = 'Other'
}

export interface GlucoseReading {
  id: string;
  runId: string;
  glucoseValue: number;
  timestamp: Date;
  mealContext?: MealContext;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGlucoseReadingDto {
  runId: string;
  glucoseValue: number;
  timestamp: Date;
  mealContext?: MealContext;
  notes?: string;
}

export interface UpdateGlucoseReadingDto {
  glucoseValue?: number;
  timestamp?: Date;
  mealContext?: MealContext;
  notes?: string;
}

// Run interfaces
export interface Run {
  id: string;
  userId: string;
  startDate: Date;
  endDate?: Date;
  estimatedA1C?: number;
  notes?: string;
  readings?: GlucoseReading[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRunDto {
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

export interface UpdateRunDto {
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}
