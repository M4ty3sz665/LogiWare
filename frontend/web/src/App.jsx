import './App.css'
import { useState, useEffect } from 'react'
import Login from './Components/Login.jsx'
import Register from './Components/Register.jsx'
import HomePage from './Components/HomePage.jsx'

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

  const handleRegister = (user, token) => {
    console.log('Sikeres regisztráció:', user)
    if (token) {
      setIsLoggedIn(true)
      setView('home')
    } else {
      setView('login')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setView('login')
  }

  return (
    <>
      {isLoggedIn && view === 'home' && (
        <HomePage
          onLogout={handleLogout}
        />
      )}
      {!isLoggedIn && view === 'login' && (
        <Login
          onLogin={handleLogin}
          onShowRegister={() => setView('register')}
        />
      )}
      {!isLoggedIn && view === 'register' && (
        <Register
          onRegister={handleRegister}
          onShowLogin={() => setView('login')}
        />
      )}
    </>
  )
}

export default App

