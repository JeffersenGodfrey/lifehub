import React, { useState, useEffect } from 'react'
import { wellnessAPI, habitAPI } from '../services/api'
import HabitManager from './HabitManager'

const WellnessTracker = () => {
  const [wellnessData, setWellnessData] = useState({
    water: 0,
    steps: 0,
    sleep: 0,
    mood: 2
  })
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTodaysWellness()
    // Load habits after a short delay to ensure auth is ready
    setTimeout(() => loadHabits(), 500)
    
    // Refresh data every 10 seconds to match dashboard
    const interval = setInterval(loadTodaysWellness, 10000)
    return () => clearInterval(interval)
  }, [])
  
  // Also refresh when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadTodaysWellness()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const loadTodaysWellness = async () => {
    try {
      const logs = await wellnessAPI.getWellnessLogs()
      const today = new Date().toISOString().split('T')[0] // Use same date format as dashboard
      const todayLog = logs.find(log => {
        const logDate = new Date(log.date).toISOString().split('T')[0]
        return logDate === today
      })
      
      if (todayLog) {
        const newData = {
          water: Number(todayLog.waterIntake) || 0,
          steps: Number(todayLog.steps) || 0,
          sleep: Number(todayLog.sleepHours) || 0,
          mood: todayLog.mood ? ['😢', '😕', '😊', '😄', '🤩'].indexOf(todayLog.mood) : 2
        }
        console.log('WellnessTracker loaded data:', newData)
        setWellnessData(newData)
      } else {
        console.log('No wellness log found for today in WellnessTracker')
      }
    } catch (error) {
      console.error('Failed to load wellness data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHabits = async (retryCount = 0) => {
    try {
      const habitsData = await habitAPI.getHabits()
      setHabits(habitsData)
    } catch (error) {
      console.error('Failed to load habits:', error)
      // Retry up to 3 times with increasing delay
      if (retryCount < 3) {
        setTimeout(() => loadHabits(retryCount + 1), (retryCount + 1) * 1000)
      }
    }
  }

  const updateWellnessData = async (updates) => {
    // Update UI immediately for better UX
    setWellnessData(prev => ({ ...prev, ...updates }))
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const wellnessLog = {
        date: today,
        waterIntake: updates.water !== undefined ? updates.water : wellnessData.water,
        steps: updates.steps !== undefined ? updates.steps : wellnessData.steps,
        sleepHours: updates.sleep !== undefined ? updates.sleep : wellnessData.sleep,
        mood: updates.mood !== undefined ? ['😢', '😕', '😊', '😄', '🤩'][updates.mood] : ['😢', '😕', '😊', '😄', '🤩'][wellnessData.mood]
      }

      console.log('Updating wellness data:', wellnessLog)
      const result = await wellnessAPI.createWellnessLog(wellnessLog)
      console.log('Wellness update successful:', result)
      
      // Notify other components about the update
      window.dispatchEvent(new CustomEvent('wellnessDataUpdated'))
    } catch (error) {
      console.error('Failed to update wellness data:', error)
      // Revert UI changes on error
      loadTodaysWellness()
    }
  }

  const updateWater = (change) => {
    const newWater = Math.max(0, Math.min(12, wellnessData.water + change))
    updateWellnessData({ water: newWater })
  }

  const updateSteps = (steps) => {
    const newSteps = Math.max(0, parseInt(steps) || 0)
    updateWellnessData({ steps: newSteps })
  }

  const updateSleep = (hours) => {
    const newSleep = Math.max(0, Math.min(24, parseFloat(hours) || 0))
    updateWellnessData({ sleep: newSleep })
  }

  const updateMood = (moodIndex) => {
    updateWellnessData({ mood: moodIndex })
  }

  const moods = ['😢', '😕', '😊', '😄', '🤩']

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading wellness data...</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>💚 Wellness Tracker</h1>
      <div className="wellness-grid">
        <div className="wellness-card">
          <h3>💧 Water Intake</h3>
          <div className="counter">
            <button className="btn-secondary" onClick={() => updateWater(-1)}>-</button>
            <span>{wellnessData.water} glasses</span>
            <button className="btn-secondary" onClick={() => updateWater(1)}>+</button>
          </div>
        </div>
        <div className="wellness-card">
          <h3>👟 Steps</h3>
          <div className="counter">
            <input
              type="number"
              value={wellnessData.steps}
              onChange={(e) => updateSteps(e.target.value)}
              className="steps-input"
              min="0"
              max="50000"
            />
            <span>steps</span>
          </div>
        </div>
        <div className="wellness-card">
          <h3>😴 Sleep</h3>
          <div className="counter">
            <input
              type="number"
              value={wellnessData.sleep}
              onChange={(e) => updateSleep(e.target.value)}
              className="sleep-input"
              min="0"
              max="24"
              step="0.5"
            />
            <span>hours</span>
          </div>
        </div>
        <div className="wellness-card">
          <h3>😊 Mood Tracker</h3>
          <div className="mood-selector">
            {moods.map((mood, index) => (
              <button
                key={index}
                className={wellnessData.mood === index ? 'active' : ''}
                onClick={() => updateMood(index)}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="habits">
        <div className="habits-header">
          <h3>Daily Habits</h3>
          <HabitManager
            habits={habits}
            onHabitAdd={(habit) => setHabits([...habits, habit])}
            onHabitToggle={async (habitId) => {
              try {
                const habit = habits.find(h => h._id === habitId)
                const updatedHabit = await habitAPI.updateHabit(habitId, { ...habit, completed: !habit.completed })
                setHabits(habits.map(h => h._id === habitId ? updatedHabit : h))
              } catch (error) {
                console.error('Failed to toggle habit:', error)
              }
            }}
            onHabitDelete={async (habitId) => {
              try {
                await habitAPI.deleteHabit(habitId)
                setHabits(habits.filter(h => h._id !== habitId))
              } catch (error) {
                console.error('Failed to delete habit:', error)
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default WellnessTracker