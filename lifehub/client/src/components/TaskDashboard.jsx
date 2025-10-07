import React, { useState, useRef, useEffect } from 'react'
import { taskAPI } from '../services/api'
import '../styles/task-dashboard.css'

const TaskDashboard = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', priority: 'Medium', category: 'Personal' })
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isAddingTask && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAddingTask])

  // Load tasks from MongoDB
  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const data = await taskAPI.getTasks()
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async () => {
    if (newTask.title.trim()) {
      try {
        const taskData = {
          title: newTask.title,
          priority: newTask.priority,
          category: newTask.category,
          completed: false
        }
        const createdTask = await taskAPI.createTask(taskData)
        setTasks([...tasks, createdTask])
        setNewTask({ title: '', priority: 'Medium', category: 'Personal' })
        setIsAddingTask(false)
      } catch (error) {
        console.error('Failed to add task:', error)
      }
    }
  }

  const handleTaskToggle = async (taskId) => {
    try {
      const task = tasks.find(t => t._id === taskId)
      const updatedTask = await taskAPI.updateTask(taskId, { ...task, completed: !task.completed })
      setTasks(tasks.map(t => t._id === taskId ? updatedTask : t))
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  }

  const handleTaskDelete = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId)
      setTasks(tasks.filter(t => t._id !== taskId))
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (filter === 'completed' && task.completed) ||
      (filter === 'pending' && !task.completed) ||
      (filter === task.priority.toLowerCase())
    return matchesSearch && matchesFilter
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ff4757'
      case 'Medium': return '#ffa502'
      case 'Low': return '#2ed573'
      default: return '#4B9DEA'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Work': return '💼'
      case 'Personal': return '👤'
      case 'Health': return '🏥'
      case 'Learning': return '📚'
      default: return '📝'
    }
  }

  return (
    <div className="task-dashboard">
      <div className="task-header">
        <div className="task-title-section">
          <h3>Task Management</h3>
          <div className="task-stats">
            <span className="stat-item">
              <span className="stat-number">{tasks.filter(t => t.completed).length}</span>
              <span className="stat-label">Completed</span>
            </span>
            <span className="stat-item">
              <span className="stat-number">{tasks.filter(t => !t.completed).length}</span>
              <span className="stat-label">Pending</span>
            </span>
          </div>
        </div>
        
        <div className="task-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      <div className="task-content">
        {/* Add Task Section */}
        <div className="add-task-section">
          {!isAddingTask ? (
            <button 
              className="add-task-trigger"
              onClick={() => setIsAddingTask(true)}
            >
              <span className="add-icon">+</span>
              <span>Add New Task</span>
            </button>
          ) : (
            <div className="add-task-form">
              <div className="form-row">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter task title..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="task-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                />
              </div>
              <div className="form-row">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="priority-select"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                  className="category-select"
                >
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="Health">Health</option>
                  <option value="Learning">Learning</option>
                </select>
              </div>
              <div className="form-actions">
                <button onClick={handleAddTask} className="save-btn">
                  ✓ Add Task
                </button>
                <button 
                  onClick={() => {
                    setIsAddingTask(false)
                    setNewTask({ title: '', priority: 'Medium', category: 'Personal' })
                  }} 
                  className="cancel-btn"
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tasks List */}
        <div className="tasks-list">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h4>No tasks found</h4>
              <p>Add your first task to get started!</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div 
                key={task._id} 
                className={`task-card ${task.completed ? 'completed' : ''}`}
              >
                <div className="task-main">
                  <button
                    className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                    onClick={() => handleTaskToggle(task._id)}
                  >
                    {task.completed && <span className="checkmark">✓</span>}
                  </button>
                  
                  <div className="task-content-area">
                    <div className="task-header-row">
                      <h4 className={`task-title ${task.completed ? 'completed-text' : ''}`}>
                        {task.title}
                      </h4>
                      <div className="task-meta">
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(task.priority) }}
                        >
                          {task.priority}
                        </span>
                        <span className="category-badge">
                          {getCategoryIcon(task.category)} {task.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="task-footer">
                      <span className="task-date">
                        {new Date(task.createdAt || task.updatedAt || Date.now()).toLocaleDateString()}
                      </span>
                      <button
                        className="delete-btn"
                        onClick={() => handleTaskDelete(task._id)}
                        title="Delete task"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskDashboard