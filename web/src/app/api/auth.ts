import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User 
} from '../../../../shared/api-interfaces/src';
import { environment } from '../../../../shared/src';
import { handleAuthResponse } from '../../../../shared/auth/src';

const API_URL = environment.apiUrl;

// Login function
export async function login(credentials: LoginRequest): Promise<User> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data: AuthResponse = await response.json();
  return handleAuthResponse(data);
}

// Register function (for future implementation)
export async function register(userData: RegisterRequest): Promise<User> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  const data: AuthResponse = await response.json();
  return handleAuthResponse(data);
}
