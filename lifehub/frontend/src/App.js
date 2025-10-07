import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [wellnessLogs, setWellnessLogs] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Low', category: '' });
  const [newWellness, setNewWellness] = useState({ sleepHours: '', waterIntake: '', steps: '', mood: '' });

  // Mock user ID for now
  const userId = 'user123';

  useEffect(() => {
    fetchTasks();
    fetchWellnessLogs();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tasks`, {
        headers: { 'user-id': userId }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchWellnessLogs = async () => {
    try {
      const response = await axios.get(`${API_BASE}/wellness`, {
        headers: { 'user-id': userId }
      });
      setWellnessLogs(response.data);
    } catch (error) {
      console.error('Error fetching wellness logs:', error);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/tasks`, newTask, {
        headers: { 'user-id': userId }
      });
      setNewTask({ title: '', description: '', priority: 'Low', category: '' });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const createWellnessLog = async (e) => {
    e.preventDefault();
    try {
      const logData = {
        ...newWellness,
        date: new Date(),
        sleepHours: parseFloat(newWellness.sleepHours) || 0,
        waterIntake: parseFloat(newWellness.waterIntake) || 0,
        steps: parseInt(newWellness.steps) || 0
      };
      await axios.post(`${API_BASE}/wellness`, logData, {
        headers: { 'user-id': userId }
      });
      setNewWellness({ sleepHours: '', waterIntake: '', steps: '', mood: '' });
      fetchWellnessLogs();
    } catch (error) {
      console.error('Error creating wellness log:', error);
    }
  };

  const toggleTask = async (taskId, completed) => {
    try {
      await axios.put(`${API_BASE}/tasks/${taskId}`, { completed: !completed });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌟 LifeHub</h1>
        <p>Your Personal Task & Wellness Manager</p>
      </header>

      <nav className="tab-nav">
        <button 
          className={activeTab === 'tasks' ? 'active' : ''} 
          onClick={() => setActiveTab('tasks')}
        >
          📋 Tasks
        </button>
        <button 
          className={activeTab === 'wellness' ? 'active' : ''} 
          onClick={() => setActiveTab('wellness')}
        >
          💪 Wellness
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'tasks' && (
          <div className="tasks-section">
            <h2>Task Management</h2>
            
            <form onSubmit={createTask} className="task-form">
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
              <input
                type="text"
                placeholder="Category"
                value={newTask.category}
                onChange={(e) => setNewTask({...newTask, category: e.target.value})}
              />
              <button type="submit">Add Task</button>
            </form>

            <div className="tasks-list">
              {tasks.map(task => (
                <div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="task-content">
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                    {task.category && <span className="category">{task.category}</span>}
                  </div>
                  <div className="task-actions">
                    <button onClick={() => toggleTask(task._id, task.completed)}>
                      {task.completed ? '↩️' : '✅'}
                    </button>
                    <button onClick={() => deleteTask(task._id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'wellness' && (
          <div className="wellness-section">
            <h2>Wellness Tracking</h2>
            
            <form onSubmit={createWellnessLog} className="wellness-form">
              <input
                type="number"
                step="0.1"
                placeholder="Sleep hours"
                value={newWellness.sleepHours}
                onChange={(e) => setNewWellness({...newWellness, sleepHours: e.target.value})}
              />
              <input
                type="number"
                step="0.1"
                placeholder="Water intake (L)"
                value={newWellness.waterIntake}
                onChange={(e) => setNewWellness({...newWellness, waterIntake: e.target.value})}
              />
              <input
                type="number"
                placeholder="Steps"
                value={newWellness.steps}
                onChange={(e) => setNewWellness({...newWellness, steps: e.target.value})}
              />
              <select
                value={newWellness.mood}
                onChange={(e) => setNewWellness({...newWellness, mood: e.target.value})}
              >
                <option value="">Select mood</option>
                <option value="Happy">😊 Happy</option>
                <option value="Neutral">😐 Neutral</option>
                <option value="Sad">😢 Sad</option>
                <option value="Energetic">⚡ Energetic</option>
                <option value="Tired">😴 Tired</option>
              </select>
              <button type="submit">Log Wellness</button>
            </form>

            <div className="wellness-logs">
              {wellnessLogs.map(log => (
                <div key={log._id} className="wellness-item">
                  <div className="wellness-date">
                    {new Date(log.date).toLocaleDateString()}
                  </div>
                  <div className="wellness-stats">
                    <span>😴 {log.sleepHours}h</span>
                    <span>💧 {log.waterIntake}L</span>
                    <span>👟 {log.steps} steps</span>
                    {log.mood && <span>{log.mood}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;