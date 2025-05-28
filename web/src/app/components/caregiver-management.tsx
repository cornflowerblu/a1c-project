import React, { useState } from 'react';
import { usePermissions } from '../context/permissions-context';

export const CaregiverManagement: React.FC = () => {
  const { caregivers } = usePermissions();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleAddCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.requestCaregiverAccess(email);
      setSuccess(`Caregiver request sent to ${email}`);
      setEmail('');
    } catch (err) {
      setError('Failed to send caregiver request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRevokeAccess = async (caregiverId: string) => {
    setLoading(true);
    
    try {
      await api.revokeCaregiverAccess(caregiverId);
      // Refresh the caregivers list
      window.location.reload();
    } catch (err) {
      setError('Failed to revoke access');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Caregiver Management</h2>
      
      {/* Add Caregiver Form */}
      <form onSubmit={handleAddCaregiver} className="mb-6">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Caregiver Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter caregiver's email"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Add Caregiver'}
        </button>
        
        {error && <p className="mt-2 text-red-600">{error}</p>}
        {success && <p className="mt-2 text-green-600">{success}</p>}
      </form>
      
      {/* Current Caregivers List */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Current Caregivers</h3>
        
        {caregivers.length === 0 ? (
          <p className="text-gray-500">You haven't added any caregivers yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {caregivers.map((caregiver) => (
              <li key={caregiver.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{caregiver.name}</p>
                  <p className="text-sm text-gray-500">{caregiver.email}</p>
                </div>
                <button
                  onClick={() => handleRevokeAccess(caregiver.id)}
                  className="text-red-600 hover:text-red-800"
                  disabled={loading}
                >
                  Revoke Access
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};