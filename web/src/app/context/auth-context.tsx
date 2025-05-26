'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginRequest, RegisterRequest } from '../../../../shared/api-interfaces/src';
import { login, register } from '../api/auth';
import { isAuthenticated, getToken, logout as authLogout } from '../../../../shared/auth/src';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          // In a real app, you would validate the token with the server
          // and get the current user data
          setIsLoading(false);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (err) {
        setUser(null);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await login(credentials);
      setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await register(userData);
      setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authLogout();
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isLoggedIn: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
