import axios from 'axios';
import { ApiResponse, CreateRunDto, Run, UpdateRunDto } from '@./source/shared/api-interfaces';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export const getRuns = async (token: string): Promise<Run[]> => {
  try {
    const response = await axios.get<ApiResponse<Run[]>>(`${API_URL}/runs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching runs:', error);
    throw error;
  }
};

export const getRun = async (id: string, token: string): Promise<Run> => {
  try {
    const response = await axios.get<ApiResponse<Run>>(`${API_URL}/runs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data as Run;
  } catch (error) {
    console.error(`Error fetching run ${id}:`, error);
    throw error;
  }
};

export const createRun = async (runData: CreateRunDto, token: string): Promise<Run> => {
  try {
    const response = await axios.post<ApiResponse<Run>>(`${API_URL}/runs`, runData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.data as Run;
  } catch (error) {
    console.error('Error creating run:', error);
    throw error;
  }
};

export const updateRun = async (id: string, runData: UpdateRunDto, token: string): Promise<Run> => {
  try {
    const response = await axios.put<ApiResponse<Run>>(`${API_URL}/runs/${id}`, runData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.data as Run;
  } catch (error) {
    console.error(`Error updating run ${id}:`, error);
    throw error;
  }
};

export const deleteRun = async (id: string, token: string): Promise<Run> => {
  try {
    const response = await axios.delete<ApiResponse<Run>>(`${API_URL}/runs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data as Run;
  } catch (error) {
    console.error(`Error deleting run ${id}:`, error);
    throw error;
  }
};

export const calculateA1C = async (id: string, token: string): Promise<number> => {
  try {
    const response = await axios.get<ApiResponse<{ estimatedA1C: number }>>(`${API_URL}/runs/${id}/estimate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data?.estimatedA1C || 0;
  } catch (error) {
    console.error(`Error calculating A1C for run ${id}:`, error);
    throw error;
  }
};