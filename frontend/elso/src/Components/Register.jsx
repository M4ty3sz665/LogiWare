import { useState, useEffect } from 'react'
import { register as apiRegister, validateEmail } from '../utils/auth'

function Register({ onRegister, onShowLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (error) setError('')
  }, [name, email, phone, password, confirmPassword, role])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !phone || !password || !confirmPassword || !role) {
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
      const data = await apiRegister({ name, email, phone, password, role })
      alert('Sikeres regisztráció!')
      if (onRegister) {
        onRegister({ name, email })
      }
    } catch (err) {
      setError(err.message || 'Hiba történt a regisztráció során.')
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
              Regisztráció
            </p>
            <p className="mt-4 text-sm text-slate-500">Hozz létre egy új fiókot.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Teljes név
              </label>
              <input
                id="name"
                type="text"
                placeholder="Teljes név"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-100 text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-100 text-sm"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                Telefonszám
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+36 30 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-100 text-sm"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
                Szerepkör
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-100 text-sm bg-white"
              >
                <option value="">Válassz...</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Jelszó
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-100 text-sm"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Jelszó megerősítése
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-100 text-sm"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? 'Regisztráció...' : 'Regisztráció'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Már van fiókod?{' '}
              <button
                type="button"
                onClick={onShowLogin}
                className="text-blue-600 hover:text-blue-800 font-semibold transition"
              >
                Bejelentkezés
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

export default Register