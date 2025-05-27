import axios from 'axios';
import { ApiResponse, CreateReadingDto, GlucoseReading, UpdateReadingDto } from '../../../shared/api-interfaces/src';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get all readings for a specific run
export const getReadingsByRun = async (runId: string): Promise<GlucoseReading[]> => {
  try {
    const response = await axios.get<ApiResponse<GlucoseReading[]>>(
      `${API_URL}/readings/run/${runId}`,
      getAuthHeader()
    );
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching readings for run ${runId}:`, error);
    throw error;
  }
};

// Get a specific reading by ID
export const getReading = async (id: string): Promise<GlucoseReading> => {
  try {
    const response = await axios.get<ApiResponse<GlucoseReading>>(
      `${API_URL}/readings/${id}`,
      getAuthHeader()
    );
    return response.data.data as GlucoseReading;
  } catch (error) {
    console.error(`Error fetching reading ${id}:`, error);
    throw error;
  }
};

// Create a new reading for a run
export const createReading = async (runId: string, readingData: CreateReadingDto): Promise<GlucoseReading> => {
  try {
    const response = await axios.post<ApiResponse<GlucoseReading>>(
      `${API_URL}/readings/run/${runId}`,
      readingData,
      getAuthHeader()
    );
    return response.data.data as GlucoseReading;
  } catch (error) {
    console.error('Error creating reading:', error);
    throw error;
  }
};

// Update an existing reading
export const updateReading = async (id: string, readingData: UpdateReadingDto): Promise<GlucoseReading> => {
  try {
    const response = await axios.put<ApiResponse<GlucoseReading>>(
      `${API_URL}/readings/${id}`,
      readingData,
      getAuthHeader()
    );
    return response.data.data as GlucoseReading;
  } catch (error) {
    console.error(`Error updating reading ${id}:`, error);
    throw error;
  }
};

// Delete a reading
export const deleteReading = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/readings/${id}`, getAuthHeader());
  } catch (error) {
    console.error(`Error deleting reading ${id}:`, error);
    throw error;
  }
};