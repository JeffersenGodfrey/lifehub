import React, { useState, useEffect } from 'react'
import '../styles/task-dashboard.css'

const SimpleTaskManager = () => {
  const [tasks, setTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDeadline, setNewTaskDeadline] = useState('')
  const [loading, setLoading] = useState(false)

  const API_URL = 'https://lifehub-wjir.onrender.com/api'

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('firebase-uid') || 'anonymous'}`,
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
    setNewTaskDeadline('')
    
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('firebase-uid') || 'anonymous'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTask.title,
          completed: false,
          priority: 'Medium',
          category: 'Personal',
          dueDate: newTaskDeadline || null
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
          'Authorization': `Bearer ${localStorage.getItem('firebase-uid') || 'anonymous'}`,
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
    console.log('Delete button clicked for task:', taskId)
    if (!window.confirm('Are you sure you want to delete this task?')) {
      console.log('User cancelled deletion')
      return
    }
    console.log('User confirmed deletion')
    
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('firebase-uid') || 'anonymous'}`
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
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Task Manager</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
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
          <input
            type="datetime-local"
            value={newTaskDeadline}
            onChange={(e) => setNewTaskDeadline(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              minWidth: '200px'
            }}
            title="Set deadline (optional)"
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
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth > 768 ? 'repeat(2, 1fr)' : '1fr',
        gap: '16px'
      }}>
        {tasks.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>No tasks yet. Add one above!</p>
        ) : (
          tasks.map(task => (
            <div
              key={task._id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: task.completed ? '#f0f8f0' : 'white',
                minHeight: '100px',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task._id)}
                  style={{ cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? '#666' : 'black',
                      display: 'block',
                      fontSize: '16px',
                      fontWeight: '500',
                      marginBottom: '4px'
                    }}
                  >
                    {task.title}
                  </span>
                  {task.dueDate && (
                    <small
                      style={{
                        color: new Date(task.dueDate) < new Date() && !task.completed ? '#ff4757' : '#666',
                        fontWeight: new Date(task.dueDate) < new Date() && !task.completed ? 'bold' : 'normal',
                        display: 'block'
                      }}
                    >
                      📅 Due: {new Date(task.dueDate).toLocaleString()}
                      {new Date(task.dueDate) < new Date() && !task.completed && ' (OVERDUE)'}
                    </small>
                  )}
                </div>
                <button
                  onClick={() => deleteTask(task._id)}
                  style={{
                    background: '#ff4757',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SimpleTaskManager