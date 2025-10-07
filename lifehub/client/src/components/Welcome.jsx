import React, { useState } from 'react'
import '../styles/welcome.css'

const Welcome = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState({
    focusGoal: 4,
    waterGoal: 8,
    sleepGoal: 8,
    interests: []
  })

  const steps = [
    {
      title: "Welcome to LifeHub! 🎉",
      subtitle: "Your personal productivity and wellness companion",
      content: (
        <div className="welcome-intro">
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon">📝</div>
              <h4>Task Management</h4>
              <p>Organize and track your daily tasks</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h4>Focus Timer</h4>
              <p>Pomodoro technique for better focus</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💚</div>
              <h4>Wellness Tracking</h4>
              <p>Monitor your health and habits</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h4>Analytics</h4>
              <p>Track your progress over time</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Set Your Goals 🎯",
      subtitle: "Let's customize LifeHub for your needs",
      content: (
        <div className="goals-setup">
          <div className="goal-item">
            <label>Daily Focus Sessions Goal</label>
            <div className="goal-input">
              <input
                type="range"
                min="2"
                max="12"
                value={preferences.focusGoal}
                onChange={(e) => setPreferences({...preferences, focusGoal: parseInt(e.target.value)})}
              />
              <span>{preferences.focusGoal} sessions</span>
            </div>
          </div>
          <div className="goal-item">
            <label>Daily Water Intake Goal</label>
            <div className="goal-input">
              <input
                type="range"
                min="4"
                max="16"
                value={preferences.waterGoal}
                onChange={(e) => setPreferences({...preferences, waterGoal: parseInt(e.target.value)})}
              />
              <span>{preferences.waterGoal} glasses</span>
            </div>
          </div>
          <div className="goal-item">
            <label>Sleep Goal</label>
            <div className="goal-input">
              <input
                type="range"
                min="6"
                max="10"
                step="0.5"
                value={preferences.sleepGoal}
                onChange={(e) => setPreferences({...preferences, sleepGoal: parseFloat(e.target.value)})}
              />
              <span>{preferences.sleepGoal} hours</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Choose Your Interests 🌟",
      subtitle: "We'll suggest relevant categories and habits",
      content: (
        <div className="interests-setup">
          <div className="interests-grid">
            {[
              { id: 'work', label: 'Work & Career', icon: '💼' },
              { id: 'health', label: 'Health & Fitness', icon: '🏥' },
              { id: 'learning', label: 'Learning & Growth', icon: '📚' },
              { id: 'creativity', label: 'Creativity & Arts', icon: '🎨' },
              { id: 'social', label: 'Social & Family', icon: '👥' },
              { id: 'finance', label: 'Finance & Money', icon: '💰' }
            ].map(interest => (
              <button
                key={interest.id}
                className={`interest-btn ${preferences.interests.includes(interest.id) ? 'selected' : ''}`}
                onClick={() => {
                  const newInterests = preferences.interests.includes(interest.id)
                    ? preferences.interests.filter(i => i !== interest.id)
                    : [...preferences.interests, interest.id]
                  setPreferences({...preferences, interests: newInterests})
                }}
              >
                <div className="interest-icon">{interest.icon}</div>
                <span>{interest.label}</span>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "You're All Set! 🚀",
      subtitle: "Ready to start your productivity journey",
      content: (
        <div className="completion-screen">
          <div className="completion-icon">✨</div>
          <div className="completion-summary">
            <h4>Your LifeHub is configured!</h4>
            <div className="summary-items">
              <div className="summary-item">
                <span className="summary-label">Focus Goal:</span>
                <span className="summary-value">{preferences.focusGoal} sessions/day</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Water Goal:</span>
                <span className="summary-value">{preferences.waterGoal} glasses/day</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Sleep Goal:</span>
                <span className="summary-value">{preferences.sleepGoal} hours/night</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Interests:</span>
                <span className="summary-value">{preferences.interests.length} selected</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save preferences and complete onboarding
      localStorage.setItem('lifehub-onboarded', 'true')
      localStorage.setItem('lifehub-preferences', JSON.stringify(preferences))
      onComplete(preferences)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="welcome-header">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="step-indicator">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        <div className="welcome-content">
          <h1>{steps[currentStep].title}</h1>
          <p className="welcome-subtitle">{steps[currentStep].subtitle}</p>
          {steps[currentStep].content}
        </div>

        <div className="welcome-actions">
          {currentStep > 0 && (
            <button className="btn-secondary" onClick={handlePrev}>
              ← Previous
            </button>
          )}
          <button className="btn-primary" onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Get Started!' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Welcome