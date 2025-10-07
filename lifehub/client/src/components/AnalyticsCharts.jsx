import React, { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const AnalyticsCharts = () => {
  const [timeRange, setTimeRange] = useState('week') // 'week' or 'month'

  // Mock data - replace with real data from your backend
  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tasks: [5, 3, 7, 4, 6, 2, 1],
    focus: [120, 90, 150, 100, 135, 60, 30], // minutes
    wellness: [8, 6, 9, 7, 8, 5, 4], // out of 10
    water: [6, 8, 7, 9, 8, 5, 6], // glasses
  }

  const monthlyData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    tasks: [28, 32, 25, 30],
    focus: [840, 920, 750, 880], // minutes
    wellness: [7.5, 8.2, 6.8, 7.9], // average out of 10
    water: [7.2, 7.8, 6.5, 7.5], // average glasses
  }

  const currentData = timeRange === 'week' ? weeklyData : monthlyData

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#1E1E1E',
          font: {
            family: 'Manrope',
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1E1E1E',
        bodyColor: '#4B5563',
        borderColor: '#4B9DEA',
        borderWidth: 1,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        ticks: {
          color: '#4B5563',
          font: {
            family: 'Manrope',
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        ticks: {
          color: '#4B5563',
          font: {
            family: 'JetBrains Mono',
            size: 10
          }
        }
      }
    }
  }

  // Task Completion Chart
  const taskData = {
    labels: currentData.labels,
    datasets: [
      {
        label: 'Tasks Completed',
        data: currentData.tasks,
        borderColor: '#4B9DEA',
        backgroundColor: 'rgba(75, 157, 234, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4B9DEA',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
      }
    ]
  }

  // Focus Time Chart
  const focusData = {
    labels: currentData.labels,
    datasets: [
      {
        label: 'Focus Time (min)',
        data: currentData.focus,
        backgroundColor: 'rgba(107, 229, 133, 0.8)',
        borderColor: '#6BE585',
        borderWidth: 2,
        borderRadius: 6,
      }
    ]
  }

  // Wellness Overview (Doughnut)
  const wellnessOverview = {
    labels: ['Tasks', 'Focus', 'Water', 'Sleep'],
    datasets: [
      {
        data: [85, 78, 92, 88], // percentages
        backgroundColor: [
          '#4B9DEA',
          '#6BE585', 
          '#FF8A65',
          '#A78BFA'
        ],
        borderWidth: 0,
        cutout: '70%',
      }
    ]
  }

  const doughnutOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: 'bottom',
        labels: {
          color: '#1E1E1E',
          font: {
            family: 'Manrope',
            size: 11,
            weight: '500'
          },
          padding: 15,
          usePointStyle: true,
        }
      }
    }
  }

  return (
    <div className="analytics-section">
      <div className="analytics-header">
        <h3>📊 Analytics & Insights</h3>
        <div className="time-range-selector">
          <button 
            className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button 
            className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
        </div>
      </div>

      <div className="charts-grid">
        {/* Task Completion Trend */}
        <div className="chart-card">
          <h4>Task Completion Trend</h4>
          <div className="chart-container">
            <Line data={taskData} options={chartOptions} />
          </div>
        </div>

        {/* Focus Time */}
        <div className="chart-card">
          <h4>Focus Time Distribution</h4>
          <div className="chart-container">
            <Bar data={focusData} options={chartOptions} />
          </div>
        </div>

        {/* Wellness Overview */}
        <div className="chart-card wellness-overview">
          <h4>Overall Wellness Score</h4>
          <div className="chart-container doughnut">
            <Doughnut data={wellnessOverview} options={doughnutOptions} />
            <div className="doughnut-center">
              <span className="score">86%</span>
              <span className="label">Overall</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="chart-card stats-summary">
          <h4>This {timeRange === 'week' ? 'Week' : 'Month'} Summary</h4>
          <div className="stats-list">
            <div className="stat-row">
              <span className="stat-icon">📝</span>
              <span className="stat-label">Tasks Completed</span>
              <span className="stat-value">{currentData.tasks.reduce((a, b) => a + b, 0)}</span>
            </div>
            <div className="stat-row">
              <span className="stat-icon">🎯</span>
              <span className="stat-label">Focus Hours</span>
              <span className="stat-value">{Math.round(currentData.focus.reduce((a, b) => a + b, 0) / 60)}h</span>
            </div>
            <div className="stat-row">
              <span className="stat-icon">💧</span>
              <span className="stat-label">Avg Water Intake</span>
              <span className="stat-value">{Math.round(currentData.water.reduce((a, b) => a + b, 0) / currentData.water.length)} glasses</span>
            </div>
            <div className="stat-row">
              <span className="stat-icon">📈</span>
              <span className="stat-label">Productivity Score</span>
              <span className="stat-value">86%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsCharts