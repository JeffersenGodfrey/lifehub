import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout, onAuthStateChange } from '../firebase/auth'
import TaskDashboard from './TaskDashboard'
import TimelineManager from './TimelineManager'
import HabitManager from './HabitManager'
import WellnessTracker from './WellnessTracker'
import DashboardStats from './DashboardStats'
import DashboardWellness from './DashboardWellness'
import WellnessChart from './WellnessChart'
import Welcome from './Welcome'
import LoadingScreen from './LoadingScreen'

import '../styles/App.css'
import '../styles/dashboard-styles.css'
import '../styles/focus-summary-styles.css'
import '../styles/wellness-styles.css'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showWelcome, setShowWelcome] = useState(false)
  const navigate = useNavigate()

  // Focus timer state
  const [focusTimer, setFocusTimer] = useState({
    timeLeft: 25 * 60,
    isActive: false,
    isBreak: false,
    sessions: 0
  })

  const [timeline, setTimeline] = useState([
    { id: 1, time: '7:00 AM', activity: 'Morning Workout', icon: '🏋️' },
    { id: 2, time: '9:00 AM', activity: 'Work Session', icon: '💻' },
    { id: 3, time: '12:00 PM', activity: 'Lunch Break', icon: '🍽️' },
    { id: 4, time: '3:00 PM', activity: 'Complete Tasks', icon: '📝' }
  ])

  useEffect(() => {
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        }
        setUser(userData)
        
        // Simple user profile sync
        setTimeout(() => {
          fetch(`${import.meta.env.VITE_API_URL || 'https://lifehub-be7p.onrender.com/api'}/users/profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${firebaseUser.uid}`
            },
            body: JSON.stringify({
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0]
            })
          }).catch(() => {})
        }, 1000)
        
        // Check if user needs onboarding
        const hasOnboarded = localStorage.getItem('lifehub-onboarded')
        if (!hasOnboarded) {
          setShowWelcome(true)
        }
        
        // Ensure loading screen shows for at least 3 seconds
        setTimeout(() => {
          setLoading(false)
        }, 3000)
      } else {
        navigate('/')
      }
    })
    return () => unsubscribe()
  }, [navigate])

  const handleLogout = async () => {
    const { success } = await logout()
    if (success) {
      navigate('/')
    }
  }



  const addTimelineItem = (timelineData) => setTimeline([...timeline, timelineData])
  const updateTimelineItem = (updatedItem) => setTimeline(timeline.map(item => item.id === updatedItem.id ? updatedItem : item))
  const deleteTimelineItem = (id) => setTimeline(timeline.filter(item => item.id !== id))



  const startTimer = () => setFocusTimer(prev => ({ ...prev, isActive: true }))
  const pauseTimer = () => setFocusTimer(prev => ({ ...prev, isActive: false }))
  const resetTimer = () => setFocusTimer(prev => ({ ...prev, isActive: false, timeLeft: prev.isBreak ? 5 * 60 : 25 * 60 }))
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Timer countdown effect
  useEffect(() => {
    let interval = null
    if (focusTimer.isActive && focusTimer.timeLeft > 0) {
      interval = setInterval(() => {
        setFocusTimer(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }))
      }, 1000)
    } else if (focusTimer.timeLeft === 0) {
      if (focusTimer.isBreak) {
        setFocusTimer(prev => ({ ...prev, timeLeft: 25 * 60, isBreak: false, isActive: false }))
      } else {
        setFocusTimer(prev => ({ ...prev, timeLeft: 5 * 60, isBreak: true, isActive: false, sessions: prev.sessions + 1 }))
      }
    }
    return () => clearInterval(interval)
  }, [focusTimer.isActive, focusTimer.timeLeft, focusTimer.isBreak])

  if (loading) {
    return <LoadingScreen onFinish={() => {}} />
  }

  if (!user) {
    return null
  }

  if (showWelcome) {
    return (
      <Welcome 
        user={user} 
        onComplete={(preferences) => {
          setShowWelcome(false)
          // You can save preferences to user profile here
          console.log('User preferences:', preferences)
        }} 
      />
    )
  }

  // Render functions from original App.jsx
  const renderDashboard = () => {
    const currentTime = new Date()
    const greeting = currentTime.getHours() < 12 ? 'Good Morning' : 
                    currentTime.getHours() < 18 ? 'Good Afternoon' : 'Good Evening'

    
    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="greeting-section">
            <h1>{greeting}, {user.name}! 👋</h1>
            <p>Welcome to your productivity dashboard.</p>
          </div>
          <div className="live-clock">
            <div className="time">{currentTime.toLocaleTimeString()}</div>
            <div className="date">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
          </div>
        </div>

        <div className="timeline-section">
          <h3>Today's Timeline</h3>
          <div className="timeline-scroll">
            {timeline.map(item => (
              <div key={item.id} className="timeline-item">
                <div className="time-badge">{item.time}</div>
                <div className="timeline-content">
                  <span className="timeline-icon">{item.icon}</span>
                  <span>{item.activity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="wellness-focus-zone">
          <h3>Wellness Tracker</h3>
          <DashboardWellness />
        </div>
        
        {/* Wellness History Chart */}
        <WellnessChart />
        
        <div className="focus-section">
          <h3>🎯 Focus Summary</h3>
          <div className="focus-summary-widget">
            <div className="focus-stats">
              <div className="focus-stat">
                <div className="stat-circle">
                  <span className="stat-value">{focusTimer.sessions}</span>
                </div>
                <span className="stat-label">Sessions</span>
              </div>
              <div className="focus-stat">
                <div className="stat-circle time-circle">
                  <span className="stat-value">{focusTimer.sessions * 25}m</span>
                </div>
                <span className="stat-label">Focus Time</span>
              </div>
            </div>
            <div className="focus-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${Math.min((focusTimer.sessions / 8) * 100, 100)}%`}}></div>
              </div>
              <span className="progress-text">Daily Goal: 8 sessions</span>
            </div>
          </div>
        </div>

        {/* Streaks & Achievements */}
        <div className="achievements-section">
          <h3>Streaks & Achievements</h3>
          <div className="achievements-grid">
            <div className="achievement-card">
              <div className="achievement-icon">🔥</div>
              <div className="achievement-content">
                <h4>3-day Consistency</h4>
                <p>Keep it up!</p>
              </div>
            </div>
            <div className="achievement-card">
              <div className="achievement-icon">🧠</div>
              <div className="achievement-content">
                <h4>Focus Master</h4>
                <p>10 completed sessions</p>
              </div>
            </div>
            <div className="achievement-card">
              <div className="achievement-icon">💧</div>
              <div className="achievement-content">
                <h4>Hydration Hero</h4>
                <p>7 days of water goals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="quote-section">
          <div className="quote-card">
            <p>"Discipline is the bridge between goals and achievement."</p>
            <span>- Jim Rohn</span>
          </div>
        </div>

        {/* Quick Stats */}
        <DashboardStats />
        
        {/* Getting Started Guide */}
        <div className="getting-started">
          <h3>🚀 Getting Started</h3>
          <div className="guide-steps">
            <div className="guide-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Add Your First Task</h4>
                <p>Go to Tasks tab and create your first task to get organized</p>
              </div>
            </div>
            <div className="guide-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Track Your Wellness</h4>
                <p>Visit Wellness tab to log water, sleep, and mood</p>
              </div>
            </div>
            <div className="guide-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Start Focus Sessions</h4>
                <p>Use the Focus tab for Pomodoro timer sessions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderTasks = () => (
    <div className="page">
      <TaskDashboard />
      <div className="timeline-management">
        <h2>🕰️ Timeline Management</h2>
        <TimelineManager
          timeline={timeline}
          onTimelineAdd={addTimelineItem}
          onTimelineUpdate={updateTimelineItem}
          onTimelineDelete={deleteTimelineItem}
        />
      </div>
    </div>
  )

  const renderWellness = () => <WellnessTracker />

  const renderFocus = () => (
    <div className="page">
      <h1>🎯 Focus Mode</h1>
      <div className="pomodoro">
        <div className="timer">
          <h2>{formatTime(focusTimer.timeLeft)}</h2>
          <p>{focusTimer.isBreak ? '☕ Break Time' : '🎯 Focus Time'}</p>
        </div>
        <div className="timer-controls">
          {!focusTimer.isActive ? (
            <button className="btn-primary" onClick={startTimer}>
              ▶️ Start {focusTimer.isBreak ? 'Break' : 'Focus'}
            </button>
          ) : (
            <button className="btn-secondary" onClick={pauseTimer}>
              ⏸️ Pause
            </button>
          )}
          <button className="btn-secondary" onClick={resetTimer}>
            🔄 Reset
          </button>
        </div>
        <div className="session-info">
          <p>Sessions completed today: <strong>{focusTimer.sessions}</strong></p>
          <p>Current mode: <strong>{focusTimer.isBreak ? 'Break (5 min)' : 'Focus (25 min)'}</strong></p>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard()
      case 'tasks': return renderTasks()
      case 'wellness': return renderWellness()
      case 'focus': return renderFocus()
      default: return renderDashboard()
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>LifeHub</h2>
        </div>
        <div className="nav-links">
          {[
            { id: 'dashboard', label: '🏠 Dashboard' },
            { id: 'tasks', label: '📝 Tasks' },
            { id: 'wellness', label: '💚 Wellness' },
            { id: 'focus', label: '🎯 Focus' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
          <div className="user-menu">
            <span className="user-greeting">Hi, {user.name}!</span>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default Dashboard