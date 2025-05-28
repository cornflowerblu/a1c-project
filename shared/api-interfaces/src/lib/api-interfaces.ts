/**
 * Common interfaces for API communication
 */

// User interfaces
export interface User {
  id: string;
  email: string;
  name: string; // This maps to fullName in the schema
  role: UserRole;
  password?: string;
  clerkId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  CAREGIVER = 'CAREGIVER',
}

// Reading interfaces
export interface Reading {
  id: string;
  value: number;
  timestamp: Date;
  type: string;
  unit?: string;
  notes?: string;
  runId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReadingDto {
  value: number;
  type: string;
  unit?: string;
  notes?: string;
  runId?: string;
  userId: string;
}

export interface UpdateReadingDto {
  value?: number;
  type?: string;
  unit?: string;
  notes?: string;
  runId?: string;
}

// Run interfaces
export enum RunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface Run {
  id: string;
  name: string;
  description?: string;
  status: RunStatus;
  startedAt?: Date;
  completedAt?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRunDto {
  name: string;
  description?: string;
  userId: string;
}

export interface UpdateRunDto {
  name?: string;
  description?: string;
  status?: RunStatus;
  startedAt?: Date;
  completedAt?: Date;
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
