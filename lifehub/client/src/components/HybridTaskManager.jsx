import React, { useState, useEffect } from 'react'

const HybridTaskManager = () => {
  const [tasks, setTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [backendStatus, setBackendStatus] = useState('checking')

  const API_URL = 'https://lifehub-be7p.onrender.com/api'

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      // Try backend first
      const response = await fetch(`${API_URL}/tasks`, {
        headers: {
          'Authorization': 'Bearer dev-user-123',
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
        setBackendStatus('connected')
        // Save to localStorage as backup
        localStorage.setItem('hybrid_tasks', JSON.stringify(data))
        return
      }
    } catch (error) {
      console.log('Backend unavailable, using localStorage')
    }
    
    // Fallback to localStorage
    setBackendStatus('offline')
    const savedTasks = localStorage.getItem('hybrid_tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }

  const syncToBackend = async (taskData, method = 'POST', taskId = null) => {
    try {
      const url = taskId ? `${API_URL}/tasks/${taskId}` : `${API_URL}/tasks`
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': 'Bearer dev-user-123',
          'Content-Type': 'application/json'
        },
        body: method !== 'DELETE' ? JSON.stringify(taskData) : undefined
      })
      
      if (response.ok) {
        setBackendStatus('connected')
        return await response.json()
      }
    } catch (error) {
      setBackendStatus('offline')
    }
    return null
  }

  const addTask = async () => {
    if (!newTaskTitle.trim()) return
    
    // Create task immediately in UI
    const tempTask = {
      _id: `temp_${Date.now()}`,
      title: newTaskTitle,
      completed: false,
      priority: 'Medium',
      category: 'Personal',
      createdAt: new Date().toISOString(),
      synced: false
    }
    
    const updatedTasks = [...tasks, tempTask]
    setTasks(updatedTasks)
    setNewTaskTitle('')
    
    // Save to localStorage immediately
    localStorage.setItem('hybrid_tasks', JSON.stringify(updatedTasks))
    
    // Try to sync to backend
    const serverTask = await syncToBackend({
      title: tempTask.title,
      completed: false,
      priority: 'Medium',
      category: 'Personal'
    })
    
    if (serverTask) {
      // Replace temp task with server task
      const syncedTasks = updatedTasks.map(t => 
        t._id === tempTask._id ? { ...serverTask, synced: true } : t
      )
      setTasks(syncedTasks)
      localStorage.setItem('hybrid_tasks', JSON.stringify(syncedTasks))
    }
  }

  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t._id === taskId)
    if (!task) return

    // Update UI immediately
    const updatedTasks = tasks.map(t => 
      t._id === taskId ? { ...t, completed: !t.completed, synced: false } : t
    )
    setTasks(updatedTasks)
    localStorage.setItem('hybrid_tasks', JSON.stringify(updatedTasks))
    
    // Try to sync to backend
    if (!taskId.startsWith('temp_')) {
      const serverTask = await syncToBackend(
        { completed: !task.completed }, 
        'PUT', 
        taskId
      )
      
      if (serverTask) {
        const syncedTasks = updatedTasks.map(t => 
          t._id === taskId ? { ...serverTask, synced: true } : t
        )
        setTasks(syncedTasks)
        localStorage.setItem('hybrid_tasks', JSON.stringify(syncedTasks))
      }
    }
  }

  const deleteTask = async (taskId) => {
    // Remove from UI immediately
    const updatedTasks = tasks.filter(t => t._id !== taskId)
    setTasks(updatedTasks)
    localStorage.setItem('hybrid_tasks', JSON.stringify(updatedTasks))
    
    // Try to sync to backend
    if (!taskId.startsWith('temp_')) {
      await syncToBackend(null, 'DELETE', taskId)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ 
        background: backendStatus === 'connected' ? '#e8f5e8' : '#fff3cd', 
        padding: '10px', 
        borderRadius: '4px', 
        marginBottom: '20px' 
      }}>
        {backendStatus === 'connected' ? '✅ Synced to cloud database' : '⚠️ Offline mode - will sync when backend available'}
      </div>
      
      <h2>Task Manager (Hybrid)</h2>
      
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
          disabled={!newTaskTitle.trim()}
          style={{
            padding: '10px 20px',
            background: '#4B9DEA',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Task
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
                background: task.completed ? '#f0f8f0' : 'white',
                opacity: task.synced === false ? 0.7 : 1
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
              {task.synced === false && <span style={{ fontSize: '12px', color: '#ff9500' }}>⏳</span>}
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
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        Total: {tasks.length} tasks | Completed: {tasks.filter(t => t.completed).length}
        {backendStatus === 'offline' && <span style={{ color: '#ff9500' }}> | Offline Mode</span>}
      </div>
    </div>
  )
}

export default HybridTaskManager