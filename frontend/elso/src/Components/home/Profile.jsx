import { useEffect, useState } from 'react'

function Profile({ userInfo, onUpdated }) {
  const [name, setName] = useState(userInfo?.name || '')
  const [email, setEmail] = useState(userInfo?.email || '')
  const [phone, setPhone] = useState(userInfo?.phone || '')
  const [role, setRole] = useState(userInfo?.role || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setName(userInfo?.name || '')
    setEmail(userInfo?.email || '')
    setPhone(userInfo?.phone || '')
    setRole(userInfo?.role || '')
  }, [userInfo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name || !email || !phone) {
      setError('Kérlek tölts ki minden kötelező mezőt.')
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/oneuser', {
        method: 'PUT',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, role }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || `HTTP ${res.status}`)
      }

      setSuccess('Mentve.')
      if (onUpdated) onUpdated()
    } catch (err) {
      setError(err?.message || 'Nem sikerült menteni.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Profil</h3>
            <p className="mt-1 text-sm text-gray-500">
              Fiók adatok szerkesztése.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Név
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Telefonszám
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Szerepkör
            </label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-2 text-xs text-gray-500">
              (Ezt később érdemes lesz a backendben korlátozni / csak adminnak engedni.)
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Mentés...' : 'Mentés'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile

