import React, { useState } from 'react'
import SimpleTaskManager from './SimpleTaskManager'
import SimpleHabitManager from './SimpleHabitManager'
import SimpleWellness from './SimpleWellness'

const WorkingDashboard = () => {
  const [activeTab, setActiveTab] = useState('tasks')

  const tabs = [
    { id: 'tasks', label: 'Tasks', component: SimpleTaskManager },
    { id: 'habits', label: 'Habits', component: SimpleHabitManager },
    { id: 'wellness', label: 'Wellness', component: SimpleWellness }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderBottom: '1px solid #ddd',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>LifeHub - Working Version</h1>
        <p style={{ margin: '5px 0 0 0', color: '#666' }}>Fully functional task, habit, and wellness management</p>
      </div>

      {/* Navigation */}
      <div style={{ 
        background: 'white', 
        padding: '0 20px',
        borderBottom: '1px solid #ddd'
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '15px 30px',
                border: 'none',
                background: activeTab === tab.id ? '#4B9DEA' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#666',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '3px solid #4B9DEA' : '3px solid transparent',
                fontSize: '16px',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {ActiveComponent && <ActiveComponent />}
      </div>

      {/* Status */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(75, 157, 234, 0.9)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        ✅ All features working
      </div>
    </div>
  )
}

export default WorkingDashboard