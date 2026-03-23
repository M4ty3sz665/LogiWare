import { useCallback, useState, useEffect } from 'react'
import Dashboard from './home/Dashboard.jsx'
import CreateOrder from './home/CreateOrder.jsx'
import Stock from './home/Stock.jsx'
import Cart from './home/Cart.jsx'
import Profile from './home/Profile.jsx'
import Orders from './home/Orders.jsx'
import { apiFetch } from '../utils/api'
import BadgeIcon from './ui/BadgeIcon.jsx'

function HomePage({ onLogout }) {
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const fetchUserInfo = useCallback(async () => {
    try {
      const data = await apiFetch('/oneuser')
      setUserInfo(data)
      setLoading(false)
    } catch {
      setError('Hiba az adatok betöltésénél')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      fetchUserInfo()
    })
  }, [fetchUserInfo])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    if (onLogout) {
      onLogout()
    }
  }, [onLogout])

  useEffect(() => {
    const handler = () => handleLogout()
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [handleLogout])

  const menuMeta = {
    dashboard: { title: 'Dashboard', label: 'DB', tone: 'indigo' },
    'create-order': { title: 'Rendelés Létrehozása', label: 'UJ', tone: 'cyan' },
    orders: { title: 'Rendelések', label: 'RD', tone: 'amber' },
    stock: { title: 'Készletkezelés', label: 'KS', tone: 'emerald' },
    cart: { title: 'Kosár', label: 'KR', tone: 'rose' },
    profile: { title: 'Profil', label: 'PR', tone: 'slate' },
  }

  const currentMenu = menuMeta[activeMenu] || menuMeta.profile

  const selectMenu = (menu) => {
    setActiveMenu(menu)
    setMobileMenuOpen(false)
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard userInfo={userInfo} onNavigate={setActiveMenu} />
      case 'create-order':
        return <CreateOrder />
      case 'orders':
        return <Orders />
      case 'stock':
        return <Stock />
      case 'cart':
        return <Cart />
      case 'profile':
        return (
          <Profile
            userInfo={userInfo}
            onUpdated={fetchUserInfo}
            onLogout={handleLogout}
          />
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-center text-gray-600 font-medium">Betöltés...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Menü bezárása"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-20 bg-black/45 md:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-xl h-screen transform transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            LogiWare
          </h1>
        </div>

        <nav className="mt-8 space-y-2 px-4 overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
          <button
            onClick={() => selectMenu('dashboard')}
            className={`w-full text-left px-6 py-3 rounded-lg transition font-medium ${
              activeMenu === 'dashboard'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            <span className="inline-flex items-center gap-3">
              <BadgeIcon label="DB" tone="indigo" size="sm" />
              <span>Dashboard</span>
            </span>
          </button>
          <button
            onClick={() => selectMenu('create-order')}
            className={`w-full text-left px-6 py-3 rounded-lg transition font-medium ${
              activeMenu === 'create-order'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            <span className="inline-flex items-center gap-3">
              <BadgeIcon label="UJ" tone="cyan" size="sm" />
              <span>Rendelés létrehozása</span>
            </span>
          </button>
          <button
            onClick={() => selectMenu('orders')}
            className={`w-full text-left px-6 py-3 rounded-lg transition font-medium ${
              activeMenu === 'orders'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            <span className="inline-flex items-center gap-3">
              <BadgeIcon label="RD" tone="amber" size="sm" />
              <span>Rendelések</span>
            </span>
          </button>
          <button
            onClick={() => selectMenu('stock')}
            className={`w-full text-left px-6 py-3 rounded-lg transition font-medium ${
              activeMenu === 'stock'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            <span className="inline-flex items-center gap-3">
              <BadgeIcon label="KS" tone="emerald" size="sm" />
              <span>Készlet</span>
            </span>
          </button>
          <button
            onClick={() => selectMenu('cart')}
            className={`w-full text-left px-6 py-3 rounded-lg transition font-medium ${
              activeMenu === 'cart'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            <span className="inline-flex items-center gap-3">
              <BadgeIcon label="KR" tone="rose" size="sm" />
              <span>Kosár</span>
            </span>
          </button>
          <button
            onClick={() => selectMenu('profile')}
            className={`w-full text-left px-6 py-3 rounded-lg transition font-medium ${
              activeMenu === 'profile'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            <span className="inline-flex items-center gap-3">
              <BadgeIcon label="PR" tone="slate" size="sm" />
              <span>Profil</span>
            </span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 w-64">
          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
          >
            <BadgeIcon label="KI" tone="rose" size="sm" />
            <span>Kijelentkezés</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-md border-b border-gray-200 px-4 py-4 md:p-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700"
                aria-label="Menü nyitása"
              >
                <span className="inline-flex flex-col gap-1">
                  <span className="h-0.5 w-4 bg-gray-700" />
                  <span className="h-0.5 w-4 bg-gray-700" />
                  <span className="h-0.5 w-4 bg-gray-700" />
                </span>
              </button>
              <div className="flex min-w-0 items-center gap-3">
                <BadgeIcon label={currentMenu.label} tone={currentMenu.tone} size="md" />
                <h2 className="text-xl md:text-3xl font-bold text-gray-800 truncate">{currentMenu.title}</h2>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="flex items-center space-x-2 group focus:outline-none"
                onClick={() => setActiveMenu('profile')}
                title="Profil megtekintése"
              >
                <span className="hidden sm:inline text-sm font-medium text-gray-700 group-hover:underline">
                  {userInfo?.name}
                </span>
                <img
                  src={`https://ui-avatars.com/api/?name=${userInfo?.name}&background=667eea&color=fff`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-transparent group-hover:border-blue-500 transition"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg font-medium">
              {error}
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default HomePage
