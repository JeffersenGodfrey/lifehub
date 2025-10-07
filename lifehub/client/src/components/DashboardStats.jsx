import React, { useState, useEffect } from 'react'
import { taskAPI, wellnessAPI } from '../services/api'

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    todayWater: 0,
    todaySleep: 0,
    loading: true
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Load tasks
      const tasks = await taskAPI.getTasks()
      const completedTasks = tasks.filter(t => t.completed).length
      
      // Load today's wellness data
      const wellnessLogs = await wellnessAPI.getWellnessLogs()
      const today = new Date().toDateString()
      const todayLog = wellnessLogs.find(log => new Date(log.date).toDateString() === today)
      
      setStats({
        totalTasks: tasks.length,
        completedTasks,
        todayWater: todayLog?.waterIntake || 0,
        todaySleep: todayLog?.sleepHours || 0,
        loading: false
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  if (stats.loading) {
    return (
      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-number">...</span>
          <span className="stat-label">Loading</span>
        </div>
      </div>
    )
  }

  return (
    <div className="quick-stats">
      <div className="stat-item">
        <span className="stat-number">{stats.totalTasks}</span>
        <span className="stat-label">Total Tasks</span>
      </div>
      <div className="stat-item">
        <span className="stat-number">{stats.completedTasks}</span>
        <span className="stat-label">Completed</span>
      </div>
      <div className="stat-item">
        <span className="stat-number">{stats.todayWater}</span>
        <span className="stat-label">Water Today</span>
      </div>
      <div className="stat-item">
        <span className="stat-number">{stats.todaySleep}h</span>
        <span className="stat-label">Sleep</span>
      </div>
    </div>
  )
}

export default DashboardStats