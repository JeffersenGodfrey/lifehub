import React, { useState, useEffect } from 'react'

const SimpleTaskManager = () => {
  const [tasks, setTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://lifehub-backend.onrender.com/api'
    : 'http://localhost:5000/api'

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: {
          'Authorization': 'Bearer test-user-123',
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
        return
      }
    } catch (error) {
      console.error('Failed to load tasks from server:', error)
    }
    
    // Fallback to localStorage
    const savedTasks = localStorage.getItem('lifehub_tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }

  const addTask = async () => {
    if (!newTaskTitle.trim()) return
    
    setLoading(true)
    const newTask = {
      _id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      priority: 'Medium',
      category: 'Personal',
      createdAt: new Date().toISOString()
    }
    
    // Add to UI immediately
    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    setNewTaskTitle('')
    
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-user-123',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTask.title,
          completed: false,
          priority: 'Medium',
          category: 'Personal'
        })
      })
      
      if (response.ok) {
        const serverTask = await response.json()
        setTasks(prevTasks => prevTasks.map(t => t._id === newTask._id ? serverTask : t))
      } else {
        localStorage.setItem('lifehub_tasks', JSON.stringify(updatedTasks))
      }
    } catch (error) {
      console.error('Add task failed:', error)
      localStorage.setItem('lifehub_tasks', JSON.stringify(updatedTasks))
    }
    setLoading(false)
  }

  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t._id === taskId)
    if (!task) return

    // Update UI immediately
    const updatedTasks = tasks.map(t => 
      t._id === taskId ? { ...t, completed: !t.completed } : t
    )
    setTasks(updatedTasks)
    
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer test-user-123',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completed: !task.completed
        })
      })
      
      if (!response.ok) {
        localStorage.setItem('lifehub_tasks', JSON.stringify(updatedTasks))
      }
    } catch (error) {
      console.error('Toggle task failed:', error)
      localStorage.setItem('lifehub_tasks', JSON.stringify(updatedTasks))
    }
  }

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer test-user-123'
        }
      })
      
      if (response.ok) {
        setTasks(tasks.filter(t => t._id !== taskId))
      }
    } catch (error) {
      console.error('Delete task failed:', error)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Task Manager</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter task title..."
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
        />
        <button
          onClick={addTask}
          disabled={loading || !newTaskTitle.trim()}
          style={{
            padding: '10px 20px',
            background: '#4B9DEA',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Adding...' : 'Add Task'}
        </button>
      </div>

      <div>
        {tasks.length === 0 ? (
          <p>No tasks yet. Add one above!</p>
        ) : (
          tasks.map(task => (
            <div
              key={task._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '10px',
                background: task.completed ? '#f0f8f0' : 'white'
              }}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task._id)}
                style={{ cursor: 'pointer' }}
              />
              <span
                style={{
                  flex: 1,
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? '#666' : 'black'
                }}
              >
                {task.title}
              </span>
              <button
                onClick={() => deleteTask(task._id)}
                style={{
                  background: '#ff4757',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SimpleTaskManager