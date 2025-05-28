import React from 'react';
import { usePermissions } from '../context/permissions-context';
import { useRouter } from 'next/router';

export const PatientSelector: React.FC = () => {
  const { caregivingPatients, loadingPermissions } = usePermissions();
  const router = useRouter();
  
  if (loadingPermissions) {
    return <div>Loading patients...</div>;
  }
  
  if (caregivingPatients.length === 0) {
    return <div>You are not a caregiver for any patients.</div>;
  }
  
  const handlePatientSelect = (patientId: string) => {
    router.push(`/patient/${patientId}/dashboard`);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Your Patients</h2>
      
      <ul className="divide-y divide-gray-200">
        {caregivingPatients.map((patient) => (
          <li 
            key={patient.id} 
            className="py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
            onClick={() => handlePatientSelect(patient.id)}
          >
            <div>
              <p className="font-medium">{patient.name}</p>
              <p className="text-sm text-gray-500">{patient.email}</p>
            </div>
            <button className="text-blue-600 hover:text-blue-800">
              View Data
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};