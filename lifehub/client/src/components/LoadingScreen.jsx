import React from 'react'
import '../styles/LoadingScreen.css'

const LoadingScreen = ({ onFinish }) => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <h2 className="loading-title">LifeHub</h2>
        
        <div className="loading-track">
          <div className="running-person">
            <div className="person-head"></div>
            <div className="person-body"></div>
            <div className="person-arm left"></div>
            <div className="person-arm right"></div>
            <div className="person-leg left"></div>
            <div className="person-leg right"></div>
          </div>
          <div className="clock-target">🕐</div>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
        
        <p className="loading-text">Preparing your day… stay productive!</p>
      </div>
    </div>
  )
}

export default LoadingScreen