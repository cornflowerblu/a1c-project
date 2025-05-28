import { Caregiver, User } from '@./api-interfaces';
import { environment } from '@./shared';
import { getToken } from '@./auth';

const API_URL = environment.apiUrl;

export class UserApi {
  
  public async setCareGivers(caregiverId: string): Promise<void> {
    const token = getToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/users/set-caregivers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ caregiverId }),  
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to set caregivers');
    }
  }

  public async setCaregivingPatients(patientId: string, caregiverId: string): Promise<void> {
    const token = getToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/users/set-caregiving-patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ patientId, caregiverId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to set care giving patients');
    }
  }

  public async getCaregivingPatients(): Promise<User[]> {
    const token = getToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/users/caregiving-patients`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch patients');
    }

    return response.json();
  }

  public async getPatientCaregivers(): Promise<User[]> {
    const token = getToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/users/patient-caregivers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch caregivers');
    }

    return response.json();
  }

  // Get all users
  public async getUsers(): Promise<User[]> {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }

    return response.json();
  }

  // Get user by ID
  public async getUserById(id: string): Promise<User> {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user');
    }

    return response.json();
  }
}