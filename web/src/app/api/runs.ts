import axios from 'axios';
import { ApiResponse, CreateRunDto, Run, RunStatistics, UpdateRunDto } from '../../../shared/api-interfaces/src';

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

// Get all runs for the current user
export const getAllRuns = async (): Promise<Run[]> => {
  try {
    const response = await axios.get<ApiResponse<Run[]>>(`${API_URL}/runs`, getAuthHeader());
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching runs:', error);
    throw error;
  }
};

// Get a specific run by ID
export const getRun = async (id: string): Promise<Run> => {
  try {
    const response = await axios.get<ApiResponse<Run>>(`${API_URL}/runs/${id}`, getAuthHeader());
    return response.data.data as Run;
  } catch (error) {
    console.error(`Error fetching run ${id}:`, error);
    throw error;
  }
};

// Create a new run
export const createRun = async (runData: CreateRunDto): Promise<Run> => {
  try {
    const response = await axios.post<ApiResponse<Run>>(`${API_URL}/runs`, runData, getAuthHeader());
    return response.data.data as Run;
  } catch (error) {
    console.error('Error creating run:', error);
    throw error;
  }
};

// Update an existing run
export const updateRun = async (id: string, runData: UpdateRunDto): Promise<Run> => {
  try {
    const response = await axios.put<ApiResponse<Run>>(`${API_URL}/runs/${id}`, runData, getAuthHeader());
    return response.data.data as Run;
  } catch (error) {
    console.error(`Error updating run ${id}:`, error);
    throw error;
  }
};

// Delete a run
export const deleteRun = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/runs/${id}`, getAuthHeader());
  } catch (error) {
    console.error(`Error deleting run ${id}:`, error);
    throw error;
  }
};

// Get statistics for a run
export const getRunStatistics = async (id: string): Promise<RunStatistics> => {
  try {
    const response = await axios.get<ApiResponse<RunStatistics>>(`${API_URL}/runs/${id}/statistics`, getAuthHeader());
    return response.data.data as RunStatistics;
  } catch (error) {
    console.error(`Error fetching statistics for run ${id}:`, error);
    throw error;
  }
};