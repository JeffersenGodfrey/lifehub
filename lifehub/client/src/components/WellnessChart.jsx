import React, { useState, useEffect, useRef } from 'react'
import { wellnessAPI } from '../services/api'

const WellnessChart = () => {
  const [chartData, setChartData] = useState([])
  const [viewMode, setViewMode] = useState('week') // 'week' or 'month'
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef(null)

  useEffect(() => {
    loadChartData()
    
    // Listen for wellness updates to refresh chart
    const handleWellnessUpdate = () => {
      loadChartData()
    }
    
    window.addEventListener('wellnessDataUpdated', handleWellnessUpdate)
    return () => window.removeEventListener('wellnessDataUpdated', handleWellnessUpdate)
  }, [viewMode])

  useEffect(() => {
    if (viewMode === 'month' && chartData.length > 0 && canvasRef.current) {
      drawChart()
    }
  }, [chartData, viewMode])

  const drawChart = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const padding = 30
    const chartHeight = height - 2 * padding
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'
    ctx.fillRect(0, 0, width, height)
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(75, 157, 234, 0.08)'
    ctx.lineWidth = 1
    for (let i = 1; i <= 3; i++) {
      const y = padding + (i * chartHeight) / 4
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }
    
    // Draw lines with better visibility
    const drawLine = (data, color, maxValue, lineWidth = 2.5) => {
      if (!data || data.length < 2) return
      
      // Filter out invalid values
      const validData = data.map(d => Number(d) || 0)
      
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      
      validData.forEach((value, i) => {
        const x = padding + (i / (validData.length - 1)) * (width - 2 * padding)
        const y = height - padding - Math.max(0, Math.min(value, maxValue)) / maxValue * chartHeight
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
      
      // Draw points with glow effect
      validData.forEach((value, i) => {
        const x = padding + (i / (validData.length - 1)) * (width - 2 * padding)
        const y = height - padding - Math.max(0, Math.min(value, maxValue)) / maxValue * chartHeight
        
        // Only draw point if value > 0
        if (value > 0) {
          ctx.shadowColor = color
          ctx.shadowBlur = 6
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(x, y, 2.5, 0, 2 * Math.PI)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })
    }
    
    // Only draw if we have data
    if (chartData && chartData.length > 0) {
      // Draw data lines with proper scaling
      const waterData = chartData.map(d => Number(d.water) || 0)
      const sleepData = chartData.map(d => Number(d.sleep) || 0)
      const stepsData = chartData.map(d => (Number(d.steps) || 0) / 1000) // Convert to thousands
      
      drawLine(waterData, '#4B9DEA', 8) // Water out of 8
      drawLine(sleepData, '#6BE585', 10) // Sleep out of 10
      drawLine(stepsData, '#FF8A65', 10) // Steps in thousands (max 10k = 10)
    } else {
      // Draw "No Data" message
      ctx.fillStyle = '#64748b'
      ctx.font = '14px Inter'
      ctx.textAlign = 'center'
      ctx.fillText('No data available', width / 2, height / 2)
    }
  }

  const loadChartData = async () => {
    setLoading(true)
    try {
      const logs = await wellnessAPI.getWellnessLogs()
      console.log('Loaded wellness logs for chart:', logs)
      console.log('Total logs found:', logs.length)
      
      // Always generate data even if no logs exist
      const processedData = processDataForChart(logs || [])
      console.log('Processed chart data:', processedData)
      console.log('Chart data length:', processedData.length)
      setChartData(processedData)
    } catch (error) {
      console.error('Failed to load chart data:', error)
      // Generate sample data even on error
      const sampleData = processDataForChart([])
      setChartData(sampleData)
    } finally {
      setLoading(false)
    }
  }

  const processDataForChart = (logs) => {
    const now = new Date()
    const days = viewMode === 'week' ? 7 : 30
    const data = []
    
    console.log('Processing chart data for', days, 'days')
    console.log('Available logs:', logs.map(log => ({
      date: log.date,
      water: log.waterIntake,
      sleep: log.sleepHours,
      steps: log.steps
    })))

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayLog = logs.find(log => {
        const logDate = new Date(log.date).toISOString().split('T')[0]
        console.log(`Comparing ${logDate} with ${dateStr}`)
        return logDate === dateStr
      })
      
      let water = 0, sleep = 0, steps = 0
      
      if (dayLog) {
        water = Number(dayLog.waterIntake) || 0
        sleep = Number(dayLog.sleepHours) || 0
        steps = Number(dayLog.steps) || 0
        console.log(`Found data for ${dateStr}:`, { water, sleep, steps })
      } else {
        console.log(`No data found for ${dateStr}`)
      }
      
      data.push({
        date: viewMode === 'week' 
          ? date.toLocaleDateString('en-US', { weekday: 'short' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        water,
        sleep,
        steps,
        rawDate: date,
        dateStr
      })
    }
    
    console.log('Final chart data:', data)
    return data
  }

  const getMaxValue = (key) => {
    if (key === 'water') return 8
    if (key === 'sleep') return 10
    if (key === 'steps') return 10000
    return 1
  }

  if (loading) {
    return (
      <div className="wellness-chart">
        <div className="chart-header">
          <h3>📊 Wellness History</h3>
        </div>
        <div className="loading-state">Loading chart...</div>
      </div>
    )
  }

  return (
    <div className="wellness-chart">
      <div className="chart-header">
        <h3>📊 Wellness History</h3>
        <div className="chart-controls">
          <button 
            className={`chart-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button 
            className={`chart-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
        </div>
      </div>

      <div className="chart-content">
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color water"></div>
            <span>Water (glasses)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color sleep"></div>
            <span>Sleep (hours)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color steps"></div>
            <span>Steps (k)</span>
          </div>
        </div>

        {viewMode === 'week' ? (
          <div className="chart-grid">
            {chartData.map((day, index) => (
              <div key={index} className="chart-day">
                <div className="chart-bars">
                  <div 
                    className="chart-bar water-bar"
                    style={{
                      height: `${(day.water / getMaxValue('water')) * 100}%`,
                      animationDelay: `${index * 0.1}s`
                    }}
                    title={`Water: ${day.water}/8 glasses`}
                  ></div>
                  <div 
                    className="chart-bar sleep-bar"
                    style={{
                      height: `${(day.sleep / getMaxValue('sleep')) * 100}%`,
                      animationDelay: `${index * 0.1 + 0.05}s`
                    }}
                    title={`Sleep: ${day.sleep} hours`}
                  ></div>
                  <div 
                    className="chart-bar steps-bar"
                    style={{
                      height: `${(day.steps / getMaxValue('steps')) * 100}%`,
                      animationDelay: `${index * 0.1 + 0.1}s`
                    }}
                    title={`Steps: ${day.steps.toLocaleString()}`}
                  ></div>
                </div>
                <div className="chart-label">{day.date}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="monthly-chart">
            <canvas 
              ref={canvasRef}
              width={450}
              height={140}
              className="chart-canvas"
            />
            <div className="chart-labels">
              {chartData.filter((_, i) => i % 5 === 0).map((day, i) => (
                <span key={i}>{day.date}</span>
              ))}
            </div>
            <div className="chart-info">
              <div className="chart-note">
                <span className="note-item"><span className="color-dot water"></span>Water (glasses)</span>
                <span className="note-item"><span className="color-dot sleep"></span>Sleep (hours)</span>
                <span className="note-item"><span className="color-dot steps"></span>Steps (k)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WellnessChart