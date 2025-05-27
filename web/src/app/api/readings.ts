import axios from 'axios';
import { ApiResponse, CreateGlucoseReadingDto, GlucoseReading, UpdateGlucoseReadingDto } from '@./source/shared/api-interfaces';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export const getReadings = async (runId: string, token: string): Promise<GlucoseReading[]> => {
  try {
    const response = await axios.get<ApiResponse<GlucoseReading[]>>(`${API_URL}/readings?runId=${runId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching readings:', error);
    throw error;
  }
};

export const getReading = async (id: string, token: string): Promise<GlucoseReading> => {
  try {
    const response = await axios.get<ApiResponse<GlucoseReading>>(`${API_URL}/readings/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data as GlucoseReading;
  } catch (error) {
    console.error(`Error fetching reading ${id}:`, error);
    throw error;
  }
};

export const createReading = async (readingData: CreateGlucoseReadingDto, token: string): Promise<GlucoseReading> => {
  try {
    const response = await axios.post<ApiResponse<GlucoseReading>>(`${API_URL}/readings`, readingData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.data as GlucoseReading;
  } catch (error) {
    console.error('Error creating reading:', error);
    throw error;
  }
};

export const updateReading = async (id: string, readingData: UpdateGlucoseReadingDto, token: string): Promise<GlucoseReading> => {
  try {
    const response = await axios.put<ApiResponse<GlucoseReading>>(`${API_URL}/readings/${id}`, readingData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.data as GlucoseReading;
  } catch (error) {
    console.error(`Error updating reading ${id}:`, error);
    throw error;
  }
};

export const deleteReading = async (id: string, token: string): Promise<GlucoseReading> => {
  try {
    const response = await axios.delete<ApiResponse<GlucoseReading>>(`${API_URL}/readings/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data as GlucoseReading;
  } catch (error) {
    console.error(`Error deleting reading ${id}:`, error);
    throw error;
  }
};