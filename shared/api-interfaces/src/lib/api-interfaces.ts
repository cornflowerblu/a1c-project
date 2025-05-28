/**
 * Common interfaces for API communication
 */

// User interfaces
export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  password?: string;
  clerkId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  CAREGIVER = 'caregiver',
}

// Reading interfaces
export interface Reading {
  id: string;
  glucoseValue: number;
  timestamp: Date;
  mealContext?: string;
  notes?: string;
  glucoseRunId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReadingDto {
  glucoseValue: number;
  timestamp: Date;
  mealContext?: string;
  notes?: string;
  glucoseRunId: string;
  userId: string;
}

export interface UpdateReadingDto {
  glucoseValue?: number;
  timestamp?: Date;
  mealContext?: string;
  notes?: string;
  glucoseRunId?: string;
}

// Run interfaces
export interface Run {
  id: string;
  startDate: Date;
  endDate?: Date;
  estimatedA1C?: number;
  notes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRunDto {
  startDate: Date;
  endDate?: Date;
  estimatedA1C?: number;
  notes?: string;
  userId: string;
}

export interface UpdateRunDto {
  startDate?: Date;
  endDate?: Date;
  estimatedA1C?: number;
  notes?: string;
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

export interface Caregiver {
  id: string;
  patientId: string;  
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
