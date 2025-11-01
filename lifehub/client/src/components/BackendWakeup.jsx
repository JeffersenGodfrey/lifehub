import React, { useState } from 'react'

const BackendWakeup = () => {
  const [status, setStatus] = useState('idle')

  const wakeupBackend = async () => {
    setStatus('waking')
    
    try {
      // Try multiple times with longer timeout
      for (let i = 0; i < 3; i++) {
        console.log(`Wakeup attempt ${i + 1}`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
        
        try {
          const response = await fetch('https://lifehub-be7p.onrender.com/', {
            signal: controller.signal
          })
          clearTimeout(timeoutId)
          
          if (response.ok) {
            setStatus('awake')
            return
          }
        } catch (error) {
          console.log(`Attempt ${i + 1} failed:`, error.message)
          if (i < 2) await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5s between attempts
        }
      }
      setStatus('failed')
    } catch (error) {
      setStatus('failed')
    }
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>Backend Status</h3>
      <p>Render free tier sleeps after 15 minutes of inactivity</p>
      
      <button 
        onClick={wakeupBackend}
        disabled={status === 'waking'}
        style={{
          padding: '10px 20px',
          background: status === 'awake' ? '#6BE585' : '#4B9DEA',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: status === 'waking' ? 'not-allowed' : 'pointer'
        }}
      >
        {status === 'idle' && 'Wake Up Backend'}
        {status === 'waking' && 'Waking up... (up to 90s)'}
        {status === 'awake' && '✅ Backend Awake'}
        {status === 'failed' && '❌ Failed - Try Again'}
      </button>
      
      {status === 'waking' && (
        <p style={{ color: '#666', marginTop: '10px' }}>
          This may take 30-90 seconds for cold start...
        </p>
      )}
    </div>
  )
}

export default BackendWakeup