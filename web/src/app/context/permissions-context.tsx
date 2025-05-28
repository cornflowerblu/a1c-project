import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import { UserApi } from '../api/users';
import { Caregiver, User } from '@./api-interfaces';

interface PermissionsContextType {
  isCaregiverFor: (userId: string) => boolean;
  caregivingPatients: any[];
  caregivers: any[];
  loadingPermissions: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

const users: UserApi = new UserApi();

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const [caregivingPatients, setCaregivingPatients] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  
  useEffect(() => {
    if (isLoggedIn && user) {
      const loadPermissions = async () => {
        try {
          // Load caregiver relationships
          if (user.role === 'caregiver') {
            const patients = await users.getCaregivingPatients();
            setCaregivingPatients(patients as any);
          }
          
          // Load patient's caregivers
          const userCaregivers = await users.getPatientCaregivers();
          setCaregivers(userCaregivers as any);
          
          setLoadingPermissions(false);
        } catch (error) {
          console.error('Failed to load permissions:', error);
          setLoadingPermissions(false);
        }
      };
      
      loadPermissions();
    }
  }, [isLoggedIn, user]);
  
  const isCaregiverFor = (userId: string): boolean => {
    const users = new UserApi();
    const caregiver: Caregiver = users.getUserById(userId) as never;
    return user?.role === 'caregiver' && caregiver.patientId === user.id;
  };
  
  return (
    <PermissionsContext.Provider value={{
      isCaregiverFor,
      caregivingPatients,
      caregivers,
      loadingPermissions,
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};