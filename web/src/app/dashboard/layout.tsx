'use client';

import React from 'react';
import DashboardSidebar from '../components/dashboard-sidebar';
import ProtectedRoute from '../components/protected-route';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <DashboardSidebar />
          </div>
          <div className="md:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
