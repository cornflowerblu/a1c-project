'use client';

import React from 'react';
import { useAuth } from '../context/auth-context';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold mb-2">Welcome, {user?.name}</h2>
          <p className="text-gray-600">
            Use the A1C Estimator to track your glucose levels and estimate your A1C.
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h2 className="text-lg font-semibold mb-2">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Latest A1C</p>
              <p className="text-xl font-bold">--</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Readings</p>
              <p className="text-xl font-bold">0</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500">No recent activity to display.</p>
          <p className="mt-2">
            <a href="/dashboard/a1c-estimator" className="text-blue-500 hover:underline">
              Start using the A1C Estimator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
