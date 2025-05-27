'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../../../shared/api-interfaces/src';
import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isLoaded: isClerkLoaded, userId, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();

  useEffect(() => {
    // Check if user is already logged in with Clerk
const { isLoaded: isClerkLoaded, userId, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();

  const mapClerkUserToUser = (clerkUser: any, userId: string): User => ({
    id: userId,
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
    role: clerkUser.publicMetadata?.role as any || 'user',
    createdAt: new Date(clerkUser.createdAt),
    updatedAt: new Date(clerkUser.updatedAt),
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isClerkLoaded) {
          if (userId && clerkUser) {
            setUser(mapClerkUserToUser(clerkUser, userId));
          } else {
            setUser(null);
          }
      try {
        if (isClerkLoaded) {
          if (userId && clerkUser) {
            // Map Clerk user to our User type
            setUser({
              id: userId,
              email: clerkUser.primaryEmailAddress?.emailAddress || '',
              name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
              role: clerkUser.publicMetadata?.role as any || 'user',
              createdAt: new Date(clerkUser.createdAt),
              updatedAt: new Date(clerkUser.updatedAt),
            });
          } else {
            setUser(null);
          }
          setIsLoading(false);
        }
} else {
            setUser(null);
          }
          setIsLoading(false);
        }
      } catch (err) {
        setUser(null);
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === 'string') {
          setError(err);
        } else {
          setError('An unknown authentication error occurred');
        }
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isClerkLoaded, userId, clerkUser]);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('An unknown error occurred during logout');
      }
    }
  };

  const value = {
    user,
    isLoading: isLoading || !isClerkLoaded,
    isLoggedIn: !!user,
        setUser(null);
        setError(err instanceof Error ? err.message : 'Authentication error');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isClerkLoaded, userId, clerkUser]);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  const value = {
    user,
    isLoading: isLoading || !isClerkLoaded,
    isLoggedIn: !!user,
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
