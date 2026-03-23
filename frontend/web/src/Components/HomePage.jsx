import { useState, useEffect } from 'react'
import '../styles/HomePage.css'

function HomePage({ onLogout, userEmail }) {
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/oneuser', {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user info')
      }

      const data = await response.json()
      setUserInfo(data)
      setLoading(false)
    } catch (err) {
      setError('Hiba az adatok betöltésénél')
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    if (onLogout) {
      onLogout()
    }
  }

  if (loading) {
    return (
      <div className="home-page">
        <div className="home-card">
          <p>Betöltés...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="home-page">
      <div className="home-card">
        <div className="home-header">
          <h1 className="home-title">Üdvözöljük!</h1>
          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Kijelentkezés
          </button>
        </div>

        {error && <div className="home-error">{error}</div>}

        {userInfo && (
          <div className="user-info">
            <div className="info-section">
              <h2>Fiók adatai</h2>
              <div className="info-row">
                <span className="info-label">Név:</span>
                <span className="info-value">{userInfo.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">E-mail:</span>
                <span className="info-value">{userInfo.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Telefonszám:</span>
                <span className="info-value">{userInfo.phone}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Csatlakozás dátuma:</span>
                <span className="info-value">
                  {new Date(userInfo.joined_at).toLocaleDateString('hu-HU')}
                </span>
              </div>
            </div>

            <div className="quick-actions">
              <button className="action-button">Profil szerkesztése</button>
              <button className="action-button">Jelszó módosítása</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
