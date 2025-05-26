'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/auth-context';

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();

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
              <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="hover:text-blue-200">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
