import React, { useEffect, useState } from 'react'

const BackendWakeup = () => {
  const [status, setStatus] = useState('waking')

  useEffect(() => {
    wakeupBackend()
  }, [])

  const wakeupBackend = async () => {
    try {
      setStatus('waking')
      const response = await fetch('https://lifehub-be7p.onrender.com/')
      if (response.ok) {
        setStatus('ready')
        setTimeout(() => setStatus('hidden'), 3000)
      } else {
        setStatus('offline')
      }
    } catch (error) {
      setStatus('offline')
    }
  }

  if (status === 'hidden') return null

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: status === 'ready' ? '#6BE585' : status === 'offline' ? '#ff4757' : '#4B9DEA',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      textAlign: 'center',
      zIndex: 10000,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      {status === 'waking' && (
        <>
          <div>🚀 Waking up backend...</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>This may take 30 seconds</div>
        </>
      )}
      {status === 'ready' && <div>✅ Backend ready!</div>}
      {status === 'offline' && (
        <>
          <div>⚠️ Backend offline</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>Using offline mode</div>
        </>
      )}
    </div>
  )
}

export default BackendWakeup