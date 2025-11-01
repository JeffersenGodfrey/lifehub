import React, { useState } from 'react'

const TestConnection = () => {
  const [result, setResult] = useState('')
  
  const testAPI = async () => {
    setResult('Testing...')
    
    const API_URL = 'https://lifehub-wjir.onrender.com/api'
    
    try {
      // Test base URL first
      const baseResponse = await fetch('https://lifehub-wjir.onrender.com/')
      const baseText = await baseResponse.text()
      
      // Test API endpoint
      const apiResponse = await fetch(`${API_URL}/test`)
      const apiData = await apiResponse.json()
      
      setResult(`✅ Base: ${baseResponse.status}\n✅ API: ${JSON.stringify(apiData)}`)
    } catch (error) {
      setResult(`❌ Error: ${error.message}`)
    }
  }
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', margin: '10px' }}>
      <button onClick={testAPI}>Test API Connection</button>
      <pre style={{ marginTop: '10px', fontSize: '12px' }}>{result}</pre>
    </div>
  )
}

export default TestConnection