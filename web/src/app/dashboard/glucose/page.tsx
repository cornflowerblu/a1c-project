'use client';

import React, { useState } from 'react';
import { RunList } from '../../components/run-list';
import { RunForm } from '../../components/forms/run-form';

export default function GlucoseManagementPage() {
  const [showNewRunForm, setShowNewRunForm] = useState(false);

  const handleRunCreated = () => {
    setShowNewRunForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Glucose Management</h1>
        <button
          onClick={() => setShowNewRunForm(!showNewRunForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {showNewRunForm ? 'Cancel' : 'New Run'}
        </button>
      </div>

      {showNewRunForm && (
        <div className="mb-8">
          <RunForm onSuccess={handleRunCreated} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Glucose Runs</h2>
        <RunList onRunDeleted={() => {}} />
      </div>
    </div>
  );
}