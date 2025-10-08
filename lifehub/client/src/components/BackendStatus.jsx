import React, { useState, useEffect } from 'react'

const BackendStatus = () => {
  const [status, setStatus] = useState('checking')
  const [apiUrl, setApiUrl] = useState('')

  useEffect(() => {
    checkBackendStatus()
  }, [])

  const checkBackendStatus = async () => {
    const API_BASE_URL = 'https://lifehub-be7p.onrender.com/api'
    setApiUrl(API_BASE_URL)
    
    try {
      const response = await fetch('https://lifehub-be7p.onrender.com/')
      if (response.ok) {
        const text = await response.text()
        if (text.includes('LifeHub API is running')) {
          setStatus('connected')
        } else {
          setStatus('error')
        }
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#6BE585'
      case 'error': return '#ff4757'
      default: return '#4B9DEA'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected': return '✅ Backend Connected'
      case 'error': return '❌ Backend Error'
      default: return '🔄 Checking...'
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(255,255,255,0.9)',
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '12px',
      color: getStatusColor(),
      border: `1px solid ${getStatusColor()}`,
      zIndex: 9999
    }}>
      <div>{getStatusText()}</div>
      <div style={{ fontSize: '10px', color: '#666' }}>
        {apiUrl}
      </div>
    </div>
  )
}

export default BackendStatus