'use client';

import React from 'react';
import { useAuth } from '../context/auth-context';

export default function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">User Profile</h2>
      
      <div className="mb-4">
        <p className="text-gray-700">
          <span className="font-medium">Name:</span> {user.name}
        </p>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700">
          <span className="font-medium">Email:</span> {user.email}
        </p>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700">
          <span className="font-medium">Role:</span> {user.role}
        </p>
      </div>
      
      <button
        onClick={logout}
        className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
