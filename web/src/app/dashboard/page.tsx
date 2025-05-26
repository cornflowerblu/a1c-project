'use client';

import React from 'react';
import ProtectedRoute from '../components/protected-route';
import UserProfile from '../components/user-profile';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Dashboard</h1>
        <UserProfile />
      </div>
    </ProtectedRoute>
  );
}
