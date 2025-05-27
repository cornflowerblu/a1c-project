'use client';

import React from 'react';
import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import { useAuth as useClerkAuth } from '@clerk/nextjs';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, isLoading } = useAuth();
  const { isLoaded: isClerkLoaded, isSignedIn } = useClerkAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isClerkLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isClerkLoaded, isSignedIn, router]);

  if (isLoading || !isClerkLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return <>{children}</>;
}
