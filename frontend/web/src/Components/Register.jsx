import { useState, useEffect } from 'react'
import { register as apiRegister, validateEmail } from '../utils/auth'

function Register({ onRegister, onShowLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (error) setError('')
  }, [name, email, phone, password, confirmPassword])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Kérlek tölts ki minden mezőt.')
      return
    }

    if (!validateEmail(email)) {
      setError('Kérlek valós e‑mail címet adj meg.')
      return
    }

    if (password !== confirmPassword) {
      setError('A jelszavak nem egyeznek.')
      return
    }

    if (password.length < 6) {
      setError('A jelszónak legalább 6 karakter hosszúnak kell lennie.')
      return
    }

    setIsSubmitting(true)

    try {
      const data = await apiRegister({ name, email, phone, password })
      alert('Sikeres regisztráció!')
      if (data.token) {
        localStorage.setItem('token', data.token)
        if (onRegister) {
          onRegister({ name, email }, data.token)
        }
      } else {
        if (onRegister) {
          onRegister({ name, email })
        }
      }
    } catch (err) {
      setError(err.message || 'Hiba történt a regisztráció során.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Regisztráció</h1>
        <p className="login-subtitle">Hozz létre egy új fiókot.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="name">Név</label>
            <input
              id="name"
              type="text"
              placeholder="Teljes név"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={isSubmitting}
            />
          </div>

          <div className="login-field">
            <label htmlFor="email">E‑mail cím</label>
            <input
              id="email"
              type="email"
              placeholder="pelda@email.hu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>

          <div className="login-field">
            <label htmlFor="phone">Telefonszám</label>
            <input
              id="phone"
              type="tel"
              placeholder="+36 30 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              disabled={isSubmitting}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Jelszó</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
          </div>

          <div className="login-field">
            <label htmlFor="confirmPassword">Jelszó megerősítése</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className="login-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Regisztráció...' : 'Regisztráció'}
          </button>
        </form>

        <p className="login-footer">
          Már van fiókod?{' '}
          <button
            type="button"
            className="login-link-button"
            onClick={onShowLogin}
          >
            Bejelentkezés
          </button>
        </p>
      </div>
    </div>
  )
}

export default Register