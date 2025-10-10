import React, { useState, useEffect } from 'react'

const SimpleWellness = () => {
  const [wellness, setWellness] = useState({
    water: 0,
    steps: 0,
    sleep: 0,
    mood: 2
  })

  const API_URL = 'https://lifehub-be7p.onrender.com/api'
  const moods = ['😢', '😕', '😊', '😄', '🤩']

  useEffect(() => {
    loadWellness()
  }, [])

  const loadWellness = async () => {
    try {
      const response = await fetch(`${API_URL}/wellness`, {
        headers: {
          'Authorization': 'Bearer dev-user-123',
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        const today = new Date().toISOString().split('T')[0]
        const todayLog = data.find(log => {
          const logDate = new Date(log.date).toISOString().split('T')[0]
          return logDate === today
        })
        
        if (todayLog) {
          setWellness({
            water: todayLog.waterIntake || 0,
            steps: todayLog.steps || 0,
            sleep: todayLog.sleepHours || 0,
            mood: moods.indexOf(todayLog.mood) !== -1 ? moods.indexOf(todayLog.mood) : 2
          })
        }
      }
    } catch (error) {
      console.error('Load wellness failed:', error)
    }
  }

  const updateWellness = async (updates) => {
    const newWellness = { ...wellness, ...updates }
    setWellness(newWellness)

    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`${API_URL}/wellness`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer dev-user-123',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: today,
          waterIntake: newWellness.water,
          steps: newWellness.steps,
          sleepHours: newWellness.sleep,
          mood: moods[newWellness.mood]
        })
      })
      
      if (!response.ok) {
        console.error('Update wellness failed')
        setWellness(wellness) // Revert on error
      }
    } catch (error) {
      console.error('Update wellness failed:', error)
      setWellness(wellness) // Revert on error
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Wellness Tracker</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        
        {/* Water */}
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>💧 Water</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => updateWellness({ water: Math.max(0, wellness.water - 1) })}
              style={{ padding: '5px 10px', background: '#ddd', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              -
            </button>
            <span style={{ minWidth: '80px', textAlign: 'center' }}>{wellness.water} glasses</span>
            <button
              onClick={() => updateWellness({ water: Math.min(12, wellness.water + 1) })}
              style={{ padding: '5px 10px', background: '#4B9DEA', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              +
            </button>
          </div>
        </div>

        {/* Steps */}
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>👟 Steps</h3>
          <input
            type="number"
            value={wellness.steps}
            onChange={(e) => updateWellness({ steps: Math.max(0, parseInt(e.target.value) || 0) })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            min="0"
            max="50000"
          />
        </div>

        {/* Sleep */}
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>😴 Sleep</h3>
          <input
            type="number"
            value={wellness.sleep}
            onChange={(e) => updateWellness({ sleep: Math.max(0, parseFloat(e.target.value) || 0) })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            min="0"
            max="24"
            step="0.5"
            placeholder="Hours"
          />
        </div>

        {/* Mood */}
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>😊 Mood</h3>
          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
            {moods.map((mood, index) => (
              <button
                key={index}
                onClick={() => updateWellness({ mood: index })}
                style={{
                  padding: '10px',
                  fontSize: '24px',
                  border: wellness.mood === index ? '2px solid #4B9DEA' : '1px solid #ddd',
                  borderRadius: '8px',
                  background: wellness.mood === index ? '#f0f8ff' : 'white',
                  cursor: 'pointer'
                }}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleWellness