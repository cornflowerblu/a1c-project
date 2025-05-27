'use client';

import React, { useState, useEffect } from 'react';
import { GlucoseReading, MealContext } from '@./source/shared/api-interfaces';
import { getReadings, deleteReading } from '../api/readings';
import { useAuth } from '../context/auth-context';

interface GlucoseReadingListProps {
  runId: string;
  onReadingDeleted?: () => void;
}

export const GlucoseReadingList: React.FC<GlucoseReadingListProps> = ({ runId, onReadingDeleted }) => {
  const { token } = useAuth();
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const data = await getReadings(runId, token);
      setReadings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching readings:', err);
      setError('Failed to load glucose readings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, [runId, token]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reading?')) {
      try {
        await deleteReading(id, token);
        fetchReadings();
        if (onReadingDeleted) {
          onReadingDeleted();
        }
      } catch (err) {
        console.error('Error deleting reading:', err);
        setError('Failed to delete reading');
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getMealContextClass = (context?: MealContext) => {
    switch (context) {
      case MealContext.BEFORE_MEAL:
        return 'bg-blue-100 text-blue-800';
      case MealContext.AFTER_MEAL:
        return 'bg-green-100 text-green-800';
      case MealContext.FASTING:
        return 'bg-purple-100 text-purple-800';
      case MealContext.BEDTIME:
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading readings...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (readings.length === 0) {
    return <div className="text-center py-4 text-gray-500">No readings found for this run.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Glucose (mg/dL)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Context
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {readings.map((reading) => (
            <tr key={reading.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(reading.timestamp)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {reading.glucoseValue}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {reading.mealContext ? (
                  <span className={`px-2 py-1 text-xs rounded-full ${getMealContextClass(reading.mealContext)}`}>
                    {reading.mealContext}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {reading.notes || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleDelete(reading.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};