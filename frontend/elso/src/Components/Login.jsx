import { useState, useEffect } from 'react'
import { login as apiLogin, validateEmail } from '../utils/auth'
import { useToast } from './ToastProvider.jsx'
import { useNavigate } from 'react-router-dom'

function Login({ onLogin, onShowRegister }) {
  const toast = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setError('')
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
      toast.success('Sikeres bejelentkezés!')
      if (onLogin) {
        onLogin({ email })
      }
      navigate('/app') // route váltás
    } catch (err) {
      setError(err.message || 'Hiba történt a bejelentkezés során.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/95 rounded-2xl shadow-xl border border-slate-100 px-8 py-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              LogiWare
            </h1>
            <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
              Bejelentkezés
            </p>
            <p className="mt-4 text-sm text-slate-500">
              Lépj be a fiókodba, hogy folytasd.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                E-mail cím
              </label>
              <input
                id="email"
                type="email"
                placeholder="pelda@email.hu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Jelszó
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting ? 'Bejelentkezés...' : 'Belépés'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Nincs még fiókod?{' '}
              <button
                type="button"
                onClick={onShowRegister}
                className="text-blue-600 hover:text-blue-800 font-semibold transition"
              >
                Regisztráció
              </button>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>© 2026 LogiWare. Minden jog fenntartva.</p>
        </div>
      </div>
    </div>
  )
}

export default Login

