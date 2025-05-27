'use client';

import React, { useState } from 'react';
import { CreateGlucoseReadingDto, MealContext } from '@./source/shared/api-interfaces';
import { createReading } from '../../api/readings';
import { useAuth } from '../../context/auth-context';

interface GlucoseReadingFormProps {
  runId: string;
  onSuccess: () => void;
}

export const GlucoseReadingForm: React.FC<GlucoseReadingFormProps> = ({ runId, onSuccess }) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateGlucoseReadingDto>({
    runId,
    glucoseValue: 0,
    timestamp: new Date(),
    mealContext: undefined,
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'glucoseValue') {
      // Validate glucose value
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 20 || numValue > 600) {
        setError('Glucose value must be between 20 and 600 mg/dL');
      } else {
        setError(null);
      }
      setFormData({ ...formData, [name]: numValue });
    } else if (name === 'timestamp') {
      setFormData({ ...formData, [name]: new Date(value) });
    } else if (name === 'mealContext') {
      setFormData({ ...formData, [name]: value as MealContext });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.glucoseValue || formData.glucoseValue < 20 || formData.glucoseValue > 600) {
      setError('Glucose value must be between 20 and 600 mg/dL');
      return;
    }

    try {
      setIsSubmitting(true);
      await createReading(formData, token);
      setFormData({
        runId,
        glucoseValue: 0,
        timestamp: new Date(),
        mealContext: undefined,
        notes: '',
      });
      setError(null);
      onSuccess();
    } catch (err) {
      console.error('Error submitting glucose reading:', err);
      setError('Failed to submit glucose reading. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add Glucose Reading</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="glucoseValue" className="block text-sm font-medium text-gray-700 mb-1">
            Glucose Value (mg/dL) *
          </label>
          <input
            type="number"
            id="glucoseValue"
            name="glucoseValue"
            value={formData.glucoseValue || ''}
            onChange={handleChange}
            min="20"
            max="600"
            step="0.1"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Valid range: 20-600 mg/dL</p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 mb-1">
            Date and Time *
          </label>
          <input
            type="datetime-local"
            id="timestamp"
            name="timestamp"
            value={formData.timestamp ? new Date(formData.timestamp).toISOString().slice(0, 16) : ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="mealContext" className="block text-sm font-medium text-gray-700 mb-1">
            Meal Context
          </label>
          <select
            id="mealContext"
            name="mealContext"
            value={formData.mealContext || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select context</option>
            <option value={MealContext.BEFORE_MEAL}>{MealContext.BEFORE_MEAL}</option>
            <option value={MealContext.AFTER_MEAL}>{MealContext.AFTER_MEAL}</option>
            <option value={MealContext.FASTING}>{MealContext.FASTING}</option>
            <option value={MealContext.BEDTIME}>{MealContext.BEDTIME}</option>
            <option value={MealContext.OTHER}>{MealContext.OTHER}</option>
          </select>
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
            placeholder="Add any additional notes about this reading..."
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isSubmitting ? 'Submitting...' : 'Add Reading'}
          </button>
        </div>
      </form>
    </div>
  );
};