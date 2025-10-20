import React from 'react'
import WorkingDashboard from './WorkingDashboard'

const PublicDemo = () => {
  return (
    <div>
      <div style={{
        background: '#4B9DEA',
        color: 'white',
        padding: '10px 20px',
        textAlign: 'center'
      }}>
        🌟 LifeHub Demo - No login required! Try adding tasks and habits below.
      </div>
      <WorkingDashboard />
    </div>
  )
}

export default PublicDemo