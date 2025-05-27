'use client';

import React, { useState, useEffect } from 'react';
import { Run } from '@./source/shared/api-interfaces';
import { getRuns, deleteRun } from '../api/runs';
import { useAuth } from '../context/auth-context';
import Link from 'next/link';

interface RunListProps {
  onRunDeleted?: () => void;
}

export const RunList: React.FC<RunListProps> = ({ onRunDeleted }) => {
  const { token } = useAuth();
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const data = await getRuns(token);
      setRuns(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching runs:', err);
      setError('Failed to load glucose runs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this run? All associated readings will also be deleted.')) {
      try {
        await deleteRun(id, token);
        fetchRuns();
        if (onRunDeleted) {
          onRunDeleted();
        }
      } catch (err) {
        console.error('Error deleting run:', err);
        setError('Failed to delete run');
      }
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return <div className="text-center py-4">Loading runs...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (runs.length === 0) {
    return <div className="text-center py-4 text-gray-500">No glucose runs found. Create a new run to get started.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              End Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Readings
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Est. A1C
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
          {runs.map((run) => (
            <tr key={run.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(run.startDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(run.endDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {run.readings?.length || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {run.estimatedA1C ? run.estimatedA1C.toFixed(1) + '%' : '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {run.notes || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link href={`/dashboard/glucose/${run.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                  View
                </Link>
                <button
                  onClick={() => handleDelete(run.id)}
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