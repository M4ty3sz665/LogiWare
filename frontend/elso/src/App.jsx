import { useCallback } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import HomePage from './Components/HomePage.jsx'

function App() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }, [navigate])

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <HomePage onLogout={handleLogout} />
}

export default App

