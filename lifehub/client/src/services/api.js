import { auth } from '../firebase/config';

const API_BASE_URL = 'https://lifehub-wjir.onrender.com/api';

// Get current user token
const getAuthToken = async () => {
  if (auth.currentUser) {
    return auth.currentUser.uid;
  }
  return 'dev-user-123'; // Fallback for development
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    console.log('Making API call to:', `${API_BASE_URL}${endpoint}`);
    const token = await getAuthToken();
    console.log('Using auth token:', token ? 'Present' : 'Missing');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    return data;
  } catch (error) {
    console.error('API call failed:', {
      endpoint,
      error: error.message,
      stack: error.stack
    });
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

// Habit API functions
export const habitAPI = {
  getHabits: () => apiCall('/habits'),
  createHabit: (habit) => apiCall('/habits', {
    method: 'POST',
    body: JSON.stringify(habit),
  }),
  updateHabit: (id, habit) => apiCall(`/habits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(habit),
  }),
  deleteHabit: (id) => apiCall(`/habits/${id}`, {
    method: 'DELETE',
  }),
};

// Timeline API functions
export const timelineAPI = {
  getTimeline: () => apiCall('/timeline'),
  createTimelineItem: (item) => apiCall('/timeline', {
    method: 'POST',
    body: JSON.stringify(item),
  }),
  updateTimelineItem: (id, item) => apiCall(`/timeline/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  }),
  deleteTimelineItem: (id) => apiCall(`/timeline/${id}`, {
    method: 'DELETE',
  }),
};

// Focus API functions
export const focusAPI = {
  getFocusStats: () => apiCall('/focus'),
  updateFocusStats: (stats) => apiCall('/focus', {
    method: 'POST',
    body: JSON.stringify(stats),
  }),
};

