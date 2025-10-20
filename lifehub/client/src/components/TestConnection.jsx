import React, { useState } from 'react'

const TestConnection = () => {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    setResult('Testing...')
    
    try {
      // Test basic connection
      const response = await fetch('https://lifehub-be7p.onrender.com/api/test')
      const data = await response.json()
      setResult(`✅ Connection OK: ${data.message}`)
      
      // Test task creation
      const taskResponse = await fetch('https://lifehub-be7p.onrender.com/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-user-123'
        },
        body: JSON.stringify({
          title: 'Test Task',
          completed: false,
          priority: 'Medium',
          category: 'Personal'
        })
      })
      
      if (taskResponse.ok) {
        const taskData = await taskResponse.json()
        setResult(prev => prev + `\n✅ Task created: ${taskData.title}`)
      } else {
        const errorText = await taskResponse.text()
        setResult(prev => prev + `\n❌ Task failed: ${errorText}`)
      }
      
    } catch (error) {
      setResult(`❌ Error: ${error.message}`)
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', margin: '20px', borderRadius: '8px' }}>
      <h3>API Connection Test</h3>
      <button 
        onClick={testAPI} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          background: '#4B9DEA', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '10px', 
        marginTop: '10px', 
        borderRadius: '4px',
        whiteSpace: 'pre-wrap'
      }}>
        {result}
      </pre>
    </div>
  )
}

export default TestConnection