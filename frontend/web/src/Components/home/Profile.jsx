import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../utils/api'
import { useToast } from '../ToastProvider.jsx'

function Profile({ userInfo, onUpdated, onLogout }) {
  const toast = useToast()
  const [name, setName] = useState(userInfo?.name || '')
  const [email, setEmail] = useState(userInfo?.email || '')
  const [phone, setPhone] = useState(userInfo?.phone || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwSubmitting, setPwSubmitting] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')

  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const canDelete = useMemo(
    () => deleteConfirmText.trim().toLowerCase() === 'torles',
    [deleteConfirmText],
  )

  useEffect(() => {
    setName(userInfo?.name || '')
    setEmail(userInfo?.email || '')
    setPhone(userInfo?.phone || '')
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
      await apiFetch('/oneuser', { method: 'PUT', body: { name, email, phone } })
      setSuccess('Mentve.')
      toast.success('Profil mentve.')
      if (onUpdated) onUpdated()
    } catch (err) {
      setError(err?.message || 'Nem sikerült menteni.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')

    if (!pwCurrent || !pwNew || !pwConfirm) {
      setPwError('Kérlek tölts ki minden mezőt.')
      return
    }
    if (pwNew.length < 6) {
      setPwError('Az új jelszó legyen legalább 6 karakter.')
      return
    }
    if (pwNew !== pwConfirm) {
      setPwError('Az új jelszavak nem egyeznek.')
      return
    }

    setPwSubmitting(true)
    try {
      await apiFetch('/oneuser/password', {
        method: 'PUT',
        body: { currentPassword: pwCurrent, newPassword: pwNew },
      })
      setPwSuccess('Jelszó frissítve.')
      toast.success('Jelszó frissítve.')
      setPwCurrent('')
      setPwNew('')
      setPwConfirm('')
    } catch (err) {
      setPwError(err?.message || 'Nem sikerült a jelszó módosítása.')
    } finally {
      setPwSubmitting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!canDelete || deleteSubmitting) return
    setDeleteError('')
    setDeleteSubmitting(true)
    try {
      await apiFetch('/oneuser', { method: 'DELETE' })
      localStorage.removeItem('token')
      if (onLogout) onLogout()
      else window.location.reload()
    } catch (err) {
      setDeleteError(err?.message || 'Nem sikerült törölni a fiókot.')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800">Biztonság</h3>
        <p className="mt-1 text-sm text-gray-500">Jelszó módosítása.</p>

        {pwError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {pwError}
          </div>
        )}
        {pwSuccess && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {pwSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Jelenlegi jelszó
            </label>
            <input
              type="password"
              value={pwCurrent}
              onChange={(e) => setPwCurrent(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Új jelszó
              </label>
              <input
                type="password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Új jelszó újra
              </label>
              <input
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={pwSubmitting}
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pwSubmitting ? 'Mentés...' : 'Jelszó módosítása'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
        <h3 className="text-lg font-bold text-red-700">Danger zone</h3>
        <p className="mt-1 text-sm text-gray-600">
          Fiók törlése végleges. A folytatáshoz írd be: <span className="font-semibold">TORLES</span>
        </p>

        {deleteError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {deleteError}
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="TORLES"
            className="w-full sm:w-52 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={!canDelete || deleteSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {deleteSubmitting ? 'Törlés...' : 'Fiók törlése'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile

