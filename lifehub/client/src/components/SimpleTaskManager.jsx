import React, { useState, useEffect } from 'react'

const SimpleTaskManager = () => {
  const [tasks, setTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const API_URL = 'http://localhost:5000/api'

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: {
          'Authorization': 'Bearer dev-user-123',
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Load tasks failed:', error)
    }
  }

  const addTask = async () => {
    if (!newTaskTitle.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer dev-user-123',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTaskTitle,
          completed: false,
          priority: 'Medium',
          category: 'Personal'
        })
      })
      
      if (response.ok) {
        const newTask = await response.json()
        setTasks([...tasks, newTask])
        setNewTaskTitle('')
      }
    } catch (error) {
      console.error('Add task failed:', error)
    }
    setLoading(false)
  }

  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t._id === taskId)
    if (!task) return

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer dev-user-123',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completed: !task.completed
        })
      })
      
      if (response.ok) {
        const updatedTask = await response.json()
        setTasks(tasks.map(t => t._id === taskId ? updatedTask : t))
      }
    } catch (error) {
      console.error('Toggle task failed:', error)
    }
  }

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer dev-user-123'
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