import { auth } from '../firebase/config';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lifehub-be7p.onrender.com/api';

console.log('API Base URL:', API_BASE_URL);

// Get current user token
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return user.uid; // Using UID as token for development
  }
  throw new Error('User not authenticated');
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Making API call to:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    });

    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Task API functions
export const taskAPI = {
  getTasks: () => apiCall('/tasks'),
  createTask: (task) => apiCall('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  }),
  updateTask: (id, task) => apiCall(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(task),
  }),
  deleteTask: (id) => apiCall(`/tasks/${id}`, {
    method: 'DELETE',
  }),
};

// Wellness API functions
export const wellnessAPI = {
  getWellnessLogs: () => apiCall('/wellness'),
  createWellnessLog: (log) => apiCall('/wellness', {
    method: 'POST',
    body: JSON.stringify(log),
  }),
  updateWellnessLog: (id, log) => apiCall(`/wellness/${id}`, {
    method: 'PUT',
    body: JSON.stringify(log),
  }),
  deleteWellnessLog: (id) => apiCall(`/wellness/${id}`, {
    method: 'DELETE',
  }),
  cleanupDuplicates: () => apiCall('/wellness/cleanup', {
    method: 'POST',
  }),
};