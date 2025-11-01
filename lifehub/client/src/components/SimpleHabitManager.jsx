import React, { useState, useEffect } from 'react'

const SimpleHabitManager = () => {
  const [habits, setHabits] = useState([])
  const [newHabitName, setNewHabitName] = useState('')
  const [loading, setLoading] = useState(false)

  const API_URL = 'https://lifehub-be7p.onrender.com/api'

  useEffect(() => {
    loadHabits()
  }, [])

  const loadHabits = async () => {
    try {
      const response = await fetch(`${API_URL}/habits`, {
        headers: {
          'Authorization': 'Bearer dev-user-123',
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setHabits(data)
        return
      }
    } catch (error) {
      console.error('Load habits failed, using localStorage:', error)
    }
    
    // Fallback to localStorage
    const savedHabits = localStorage.getItem('lifehub_habits')
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits))
    }
  }

  const addHabit = async () => {
    if (!newHabitName.trim()) return
    
    setLoading(true)
    const newHabit = {
      _id: Date.now().toString(),
      name: newHabitName,
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    // Add to UI immediately
    const updatedHabits = [...habits, newHabit]
    setHabits(updatedHabits)
    setNewHabitName('')
    
    try {
      const response = await fetch(`${API_URL}/habits`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer dev-user-123',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newHabit.name,
          completed: false
        })
      })
      
      if (response.ok) {
        const serverHabit = await response.json()
        setHabits(prevHabits => prevHabits.map(h => h._id === newHabit._id ? serverHabit : h))
      } else {
        const errorText = await response.text()
        console.error('Server error:', response.status, errorText)
        localStorage.setItem('lifehub_habits', JSON.stringify(updatedHabits))
      }
    } catch (error) {
      console.error('Add habit failed, using localStorage:', error)
      localStorage.setItem('lifehub_habits', JSON.stringify(updatedHabits))
    }
    setLoading(false)
  }

  const toggleHabit = async (habitId) => {
    const habit = habits.find(h => h._id === habitId)
    if (!habit) return

    try {
      const response = await fetch(`${API_URL}/habits/${habitId}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer dev-user-123',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completed: !habit.completed
        })
      })
      
      if (response.ok) {
        const updatedHabit = await response.json()
        setHabits(habits.map(h => h._id === habitId ? updatedHabit : h))
      }
    } catch (error) {
      console.error('Toggle habit failed:', error)
    }
  }

  const deleteHabit = async (habitId) => {
    try {
      const response = await fetch(`${API_URL}/habits/${habitId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer dev-user-123'
        }
      })
      
      if (response.ok) {
        setHabits(habits.filter(h => h._id !== habitId))
      }
    } catch (error) {
      console.error('Delete habit failed:', error)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Habit Tracker</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder="Enter habit name..."
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
          onKeyPress={(e) => e.key === 'Enter' && addHabit()}
        />
        <button
          onClick={addHabit}
          disabled={loading || !newHabitName.trim()}
          style={{
            padding: '10px 20px',
            background: '#6BE585',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Adding...' : 'Add Habit'}
        </button>
      </div>

      <div>
        {habits.length === 0 ? (
          <p>No habits yet. Add one above!</p>
        ) : (
          habits.map(habit => (
            <div
              key={habit._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '10px',
                background: habit.completed ? '#f0f8f0' : 'white'
              }}
            >
              <input
                type="checkbox"
                checked={habit.completed}
                onChange={() => toggleHabit(habit._id)}
                style={{ cursor: 'pointer' }}
              />
              <span
                style={{
                  flex: 1,
                  textDecoration: habit.completed ? 'line-through' : 'none',
                  color: habit.completed ? '#666' : 'black'
                }}
              >
                {habit.name}
              </span>
              <button
                onClick={() => deleteHabit(habit._id)}
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

export default SimpleHabitManager