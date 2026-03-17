import { useState, useEffect } from 'react'
import Login from './Components/Login.jsx'
import Register from './Components/Register.jsx'
import HomePage from './Components/HomePage.jsx'
import { ToastProvider } from './Components/ToastProvider.jsx'

function App() {
  const [view, setView] = useState('login') // 'login', 'register', or 'home'
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
      setView('home')
    } 
  }, [])

  const handleLogin = (user) => {
    console.log('Sikeres bejelentkezés:', user)
    setIsLoggedIn(true)
    setView('home')
  }

  const handleRegister = (user) => {
    console.log('Sikeres regisztráció:', user)
    setView('login') // vissza a bejelentkezéshez
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setView('login')
  }

  return (
    <ToastProvider>
      {isLoggedIn && view === 'home' && <HomePage onLogout={handleLogout} />}
      {!isLoggedIn && view === 'login' && (
        <Login onLogin={handleLogin} onShowRegister={() => setView('register')} />
      )}
      {!isLoggedIn && view === 'register' && (
        <Register onRegister={handleRegister} onShowLogin={() => setView('login')} />
      )}
    </ToastProvider>
  )
}

export default App

