'use client';

import React from 'react';
import ProtectedRoute from '../../components/protected-route';
import A1CCalculator from '../../components/a1c-calculator';

// Force dynamic rendering to avoid prerender issues with environment variables
export const dynamic = 'force-dynamic';

export default function A1CEstimatorPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">A1C Estimator</h1>
        <p className="text-center text-gray-600 mb-8">
          Enter your glucose readings to estimate your A1C level. For accurate results, enter at least 8 readings.
        </p>
        <A1CCalculator />
      </div>
    </ProtectedRoute>
  );
}
