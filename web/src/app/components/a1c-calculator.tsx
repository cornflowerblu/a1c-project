'use client';

import React, { useState } from 'react';

interface GlucoseReading {
  value: number;
  timestamp: Date;
  mealContext?: string;
  notes?: string;
}

interface Run {
  id?: string;
  startDate: Date;
  endDate?: Date;
  readings: GlucoseReading[];
  estimatedA1C?: number;
  notes?: string;
}

export default function A1CCalculator() {
  const [glucoseValue, setGlucoseValue] = useState<number | ''>('');
  const [mealContext, setMealContext] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [currentRun, setCurrentRun] = useState<Run>({
    startDate: new Date(),
    readings: []
  });
  const [estimatedA1C, setEstimatedA1C] = useState<number | null>(null);

  const handleAddReading = () => {
    if (glucoseValue === '') return;
    
    const newReading: GlucoseReading = {
      value: Number(glucoseValue),
      timestamp: new Date(),
      mealContext: mealContext || undefined,
      notes: notes || undefined
    };
    
    setCurrentRun(prev => ({
      ...prev,
      readings: [...prev.readings, newReading]
    }));
    
    // Reset form
    setGlucoseValue('');
    setMealContext('');
    setNotes('');
  };

  const calculateA1C = () => {
    if (currentRun.readings.length < 8) {
      alert('Please enter at least 8 glucose readings to estimate A1C');
      return;
    }
    
    // Simple A1C estimation formula: (average glucose + 46.7) / 28.7
    const avgGlucose = currentRun.readings.reduce((sum, reading) => sum + reading.value, 0) / currentRun.readings.length;
    const a1c = (avgGlucose + 46.7) / 28.7;
    
    setEstimatedA1C(parseFloat(a1c.toFixed(1)));
    setCurrentRun(prev => ({
      ...prev,
      endDate: new Date(),
      estimatedA1C: parseFloat(a1c.toFixed(1))
    }));
  };

  const handleSaveRun = () => {
    // Here you would save the run to your database
    console.log('Saving run:', currentRun);
    alert('Run saved successfully!');
    
    // Reset for a new run
    setCurrentRun({
      startDate: new Date(),
      readings: []
    });
    setEstimatedA1C(null);
  };

  const handleDeleteReading = (index: number) => {
    setCurrentRun(prev => ({
      ...prev,
      readings: prev.readings.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">A1C Estimator</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Add Glucose Reading</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Glucose Value (mg/dL)
            </label>
            <input
              type="number"
              value={glucoseValue}
              onChange={(e) => setGlucoseValue(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter glucose value"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meal Context
            </label>
            <select
              value={mealContext}
              onChange={(e) => setMealContext(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select context</option>
              <option value="Before meal">Before meal</option>
              <option value="After meal">After meal</option>
              <option value="Fasting">Fasting</option>
              <option value="Bedtime">Bedtime</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Optional notes"
            />
          </div>
        </div>
        
        <button
          onClick={handleAddReading}
          disabled={glucoseValue === ''}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          Add Reading
        </button>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Current Readings</h3>
        {currentRun.readings.length === 0 ? (
          <p className="text-gray-500">No readings added yet. Add at least 8 readings to estimate A1C.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Value (mg/dL)</th>
                  <th className="py-2 px-4 border-b text-left">Time</th>
                  <th className="py-2 px-4 border-b text-left">Context</th>
                  <th className="py-2 px-4 border-b text-left">Notes</th>
                  <th className="py-2 px-4 border-b text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentRun.readings.map((reading, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">{reading.value}</td>
                    <td className="py-2 px-4 border-b">{reading.timestamp.toLocaleTimeString()}</td>
                    <td className="py-2 px-4 border-b">{reading.mealContext || '-'}</td>
                    <td className="py-2 px-4 border-b">{reading.notes || '-'}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleDeleteReading(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 flex space-x-4">
          <button
            onClick={calculateA1C}
            disabled={currentRun.readings.length < 8}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-green-300"
          >
            Estimate A1C
          </button>
          
          {estimatedA1C && (
            <button
              onClick={handleSaveRun}
              className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600"
            >
              Save Run
            </button>
          )}
        </div>
      </div>
      
      {estimatedA1C && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold mb-2">Estimated A1C</h3>
          <div className="text-3xl font-bold text-blue-700">{estimatedA1C}%</div>
          <p className="mt-2 text-sm text-gray-600">
            This is an estimate based on your glucose readings. For accurate results, please consult with your healthcare provider.
          </p>
        </div>
      )}
    </div>
  );
}
