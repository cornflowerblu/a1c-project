import { User } from '../../../../shared/api-interfaces/src';
import { environment } from '../../../../shared/src';
import { getToken } from '../../../../shared/auth/src';

const API_URL = environment.apiUrl;

// Get all users
export async function getUsers(): Promise<User[]> {
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
export async function getUserById(id: string): Promise<User> {
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
