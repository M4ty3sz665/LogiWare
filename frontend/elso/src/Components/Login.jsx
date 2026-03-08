import { useState, useEffect } from 'react'
import { login as apiLogin, validateEmail } from '../utils/auth'

function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (error) setError('')
  }, [email, password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Kérlek tölts ki minden mezőt.')
      return
    }

    if (!validateEmail(email)) {
      setError('Kérlek valós e‑mail címet adj meg.')
      return
    }

    setIsSubmitting(true)

    try {
      const data = await apiLogin({ email, password })
      localStorage.setItem('token', data.token)
      alert('Sikeres bejelentkezés!')
      if (onLogin) {
        onLogin({ email, rememberMe })
      }
    } catch (err) {
      setError(err.message || 'Hiba történt a bejelentkezés során.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Bejelentkezés</h1>
        <p className="login-subtitle">Lépj be a fiókodba, hogy folytasd.</p>

        <form className="login-form" onSubmit={handleSubmit}>
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
            <label htmlFor="password">Jelszó</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </div>

          <div className="login-row">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Emlékezz rám</span>
            </label>

            <button
              type="button"
              className="login-link-button"
              onClick={() => alert('Itt lehetne jelszó visszaállítás.')}
            >
              Elfelejtett jelszó?
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className="login-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Bejelentkezés...' : 'Belépés'}
          </button>
        </form>

        <p className="login-footer">
          Nincs még fiókod?{' '}
          <button
            type="button"
            className="login-link-button"
            onClick={onShowRegister}
          >
            Regisztráció
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login

