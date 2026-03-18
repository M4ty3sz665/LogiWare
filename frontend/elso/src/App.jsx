import { useState, useEffect } from 'react'
import Login from './Components/Login.jsx'
import Register from './Components/Register.jsx'
import HomePage from './Components/HomePage.jsx'


function App() {
  const [view, setView] = useState('login'); // 'login', 'register', or 'home'
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setView('home');
    }
  }, []);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setView('home');
  };

  const handleRegister = (user) => {
    setView('login');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setView('login');
    localStorage.removeItem('token');
  };

  if (isLoggedIn && view === 'home') {
    return <HomePage onLogout={handleLogout} />;
  }
  if (!isLoggedIn && view === 'login') {
    return <Login onLogin={handleLogin} onShowRegister={() => setView('register')} />;
  }
  if (!isLoggedIn && view === 'register') {
    return <Register onRegister={handleRegister} onShowLogin={() => setView('login')} />;
  }
  return null;
}

export default App

