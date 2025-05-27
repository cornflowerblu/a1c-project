'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Run } from '@./source/shared/api-interfaces';
import { getRun, calculateA1C } from '../../../api/runs';
import { GlucoseReadingList } from '../../../components/glucose-reading-list';
import { GlucoseReadingForm } from '../../../components/forms/glucose-reading-form';
import { useAuth } from '../../../context/auth-context';
import Link from 'next/link';

export default function GlucoseRunDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewReadingForm, setShowNewReadingForm] = useState(false);

  const fetchRun = async () => {
    try {
      setLoading(true);
      const data = await getRun(id as string, token);
      setRun(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching run:', err);
      setError('Failed to load glucose run');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateA1C = async () => {
    try {
      const estimatedA1C = await calculateA1C(id as string, token);
      setRun(prev => prev ? { ...prev, estimatedA1C } : null);
    } catch (err) {
      console.error('Error calculating A1C:', err);
      setError('Failed to calculate A1C');
    }
  };

  useEffect(() => {
    if (id) {
      fetchRun();
    }
  }, [id, token]);

  const handleReadingAdded = () => {
    setShowNewReadingForm(false);
    fetchRun();
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return <div className="text-center py-4">Loading run details...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!run) {
    return <div className="text-center py-4 text-gray-500">Run not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/glucose" className="text-blue-600 hover:text-blue-800">
          &larr; Back to Glucose Management
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Glucose Run Details</h1>
          <button
            onClick={handleCalculateA1C}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Calculate A1C
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-600">Start Date:</p>
            <p className="font-semibold">{formatDate(run.startDate)}</p>
          </div>
          <div>
            <p className="text-gray-600">End Date:</p>
            <p className="font-semibold">{formatDate(run.endDate)}</p>
          </div>
          <div>
            <p className="text-gray-600">Number of Readings:</p>
            <p className="font-semibold">{run.readings?.length || 0}</p>
          </div>
          <div>
            <p className="text-gray-600">Estimated A1C:</p>
            <p className="font-semibold">{run.estimatedA1C ? `${run.estimatedA1C.toFixed(1)}%` : 'Not calculated'}</p>
          </div>
        </div>

        {run.notes && (
          <div className="mb-6">
            <p className="text-gray-600">Notes:</p>
            <p className="mt-1">{run.notes}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Glucose Readings</h2>
        <button
          onClick={() => setShowNewReadingForm(!showNewReadingForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {showNewReadingForm ? 'Cancel' : 'Add Reading'}
        </button>
      </div>

      {showNewReadingForm && (
        <div className="mb-8">
          <GlucoseReadingForm runId={run.id} onSuccess={handleReadingAdded} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <GlucoseReadingList runId={run.id} onReadingDeleted={fetchRun} />
      </div>
    </div>
  );
}