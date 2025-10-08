import { auth } from '../firebase/config';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lifehub-be7p.onrender.com/api';

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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
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

// User API functions
export const userAPI = {
  createOrUpdateProfile: (userData) => apiCall('/users/profile', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  getProfile: () => apiCall('/users/profile'),
  updateNotifications: (enabled) => apiCall('/users/notifications', {
    method: 'PUT',
    body: JSON.stringify({ notificationsEnabled: enabled }),
  }),
};