'use client';

import React, { useState } from 'react';
import { CreateRunDto } from '@./source/shared/api-interfaces';
import { createRun } from '../../api/runs';
import { useAuth } from '../../context/auth-context';

interface RunFormProps {
  onSuccess: () => void;
}

export const RunForm: React.FC<RunFormProps> = ({ onSuccess }) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateRunDto>({
    startDate: new Date(),
    endDate: undefined,
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startDate' || name === 'endDate') {
      setFormData({ ...formData, [name]: value ? new Date(value) : undefined });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('Start date must be before end date');
      return;
    }

    try {
      setIsSubmitting(true);
      await createRun(formData, token);
      setFormData({
        startDate: new Date(),
        endDate: undefined,
        notes: '',
      });
      setError(null);
      onSuccess();
    } catch (err) {
      console.error('Error creating run:', err);
      setError('Failed to create run. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create New Glucose Run</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 10) : ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 10) : ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank for ongoing runs</p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any notes about this glucose monitoring run..."
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isSubmitting ? 'Creating...' : 'Create Run'}
          </button>
        </div>
      </form>
    </div>
  );
};