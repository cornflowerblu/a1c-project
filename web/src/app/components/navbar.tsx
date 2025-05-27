'use client';

import React from 'react';
import Link from 'next/link';
import { UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useAuth } from '../context/auth-context';

export default function Navbar() {
  const { user, isLoggedIn } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          A1C Project
        </Link>
        
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <span className="hidden md:inline">Welcome, {user?.name}</span>
              <Link href="/dashboard" className="hover:text-blue-200">
                Dashboard
              </Link>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-8 h-8',
                  }
                }}
              />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="hover:text-blue-200">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-white text-blue-600 hover:bg-blue-100 px-3 py-1 rounded">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
