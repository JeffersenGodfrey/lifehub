import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import WorkingDashboard from './components/WorkingDashboard'
import PublicDemo from './components/PublicDemo'
import BackendWakeup from './components/BackendWakeup'
import './styles/Auth.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/working" element={<WorkingDashboard />} />
        <Route path="/demo" element={<PublicDemo />} />
        <Route path="/wakeup" element={<BackendWakeup />} />
      </Routes>
    </Router>
  )
}

export default App