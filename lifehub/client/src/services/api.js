import { auth } from '../firebase/config';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get current user token
const getAuthToken = async () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      if (user) {
        resolve(user.uid);
      } else {
        reject(new Error('User not authenticated'));
      }
    });
  });
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

