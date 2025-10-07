import React, { useState, useEffect, useRef } from 'react'
import { wellnessAPI } from '../services/api'

const DashboardWellness = () => {
  const [wellnessData, setWellnessData] = useState({
    water: 0,
    sleep: 0,
    mood: 2,
    steps: 0
  })
  const [loading, setLoading] = useState(true)
  const [animatedSteps, setAnimatedSteps] = useState(0)
  const stepsRef = useRef(0)

  useEffect(() => {
    loadTodaysWellness()
    
    // Listen for wellness updates from other components
    const handleWellnessUpdate = () => {
      loadTodaysWellness()
    }
    
    window.addEventListener('wellnessDataUpdated', handleWellnessUpdate)
    
    // Refresh data every 10 seconds for better responsiveness
    const interval = setInterval(loadTodaysWellness, 10000)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('wellnessDataUpdated', handleWellnessUpdate)
    }
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
      const today = new Date().toISOString().split('T')[0]
      const todayLog = logs.find(log => {
        const logDate = new Date(log.date).toISOString().split('T')[0]
        return logDate === today
      })
      
      if (todayLog) {
        const moodIndex = todayLog.mood ? ['😢', '😕', '😊', '😄', '🤩'].indexOf(todayLog.mood) : 2
        const newData = {
          water: Number(todayLog.waterIntake) || 0,
          sleep: Number(todayLog.sleepHours) || 0,
          mood: moodIndex >= 0 ? moodIndex : 2,
          steps: Number(todayLog.steps) || 0
        }
        console.log('DashboardWellness loaded data:', newData)
        setWellnessData(newData)
        
        // Animate steps counter
        if (newData.steps !== stepsRef.current) {
          animateStepsCounter(stepsRef.current, newData.steps)
          stepsRef.current = newData.steps
        }
      } else {
        console.log('No wellness log found for today in DashboardWellness')
      }
    } catch (error) {
      console.error('Failed to load wellness data:', error)
    } finally {
      setLoading(false)
    }
  }

  const animateStepsCounter = (from, to) => {
    const duration = 1000
    const steps = 60
    const increment = (to - from) / steps
    let current = from
    let step = 0
    
    const timer = setInterval(() => {
      step++
      current += increment
      
      if (step >= steps) {
        setAnimatedSteps(to)
        clearInterval(timer)
      } else {
        setAnimatedSteps(Math.round(current))
      }
    }, duration / steps)
  }

  if (loading) {
    return (
      <div className="wellness-grid">
        <div className="wellness-widget">
          <h4>Loading...</h4>
        </div>
      </div>
    )
  }

  return (
    <div className="wellness-grid">
      <div className="wellness-widget mood-tracker">
        <h4>Mood Tracker</h4>
        <div className="mood-selector">
          {['😢', '😕', '😊', '😄', '🤩'].map((mood, index) => (
            <button 
              key={index} 
              className={wellnessData.mood === index ? 'mood-btn active' : 'mood-btn'}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
      
      <div className="wellness-widget water-intake">
        <h4>Water Intake</h4>
        <div className="water-progress">
          <div className="water-circle">
            <div 
              className="water-fill" 
              style={{
                height: `${Math.min((wellnessData.water / 8) * 100, 100)}%`,
                transition: 'height 0.5s ease'
              }}
            ></div>
            <span className="water-text">{wellnessData.water || 0}/8</span>
          </div>
        </div>
      </div>
      
      <div className="wellness-widget sleep-log">
        <h4>Sleep Pattern</h4>
        <div className="sleep-display">
          <div className="sleep-hours">
            <span className="sleep-number">{wellnessData.sleep}h</span>
            <span className="sleep-label">Last Night</span>
          </div>
          <div className="sleep-chart">
            {[...Array(7)].map((_, i) => {
              const height = i === 6 ? 
                Math.min((wellnessData.sleep / 10) * 100, 100) : 
                60 + Math.random() * 40
              return (
                <div 
                  key={i} 
                  className="sleep-bar" 
                  style={{
                    height: `${height}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              )
            })}
          </div>
        </div>
      </div>
      
      <div className="wellness-widget steps-tracker">
        <h4>Steps Today</h4>
        <div className="steps-display">
          <div className="steps-number animated-counter">
            <span className="steps-count">{animatedSteps.toLocaleString()}</span>
            <div className="steps-animation">
              <span className="step-icon">👟</span>
              <div className="walking-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
          <div className="steps-progress">
            <div 
              className="steps-bar" 
              style={{
                width: `${Math.min((wellnessData.steps / 10000) * 100, 100)}%`,
                transition: 'width 0.5s ease'
              }}
            ></div>
          </div>
          <div className="steps-goal">Goal: 10,000</div>
        </div>
      </div>
    </div>
  )
}

export default DashboardWellness