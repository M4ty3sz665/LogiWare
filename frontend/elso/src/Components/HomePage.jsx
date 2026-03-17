import { useState, useEffect } from 'react'

function HomePage({ onLogout, userEmail }) {
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeMenu, setActiveMenu] = useState('dashboard')

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
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-xl fixed h-screen">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            LogiWare
          </h1>
          <p className="text-sm text-gray-400 mt-2">{userInfo?.role?.toUpperCase()}</p>
        </div>

        <nav className="mt-8 space-y-2 px-4 overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
          <button
            onClick={() => setActiveMenu('dashboard')}
            className={`w-full text-left px-6 py-3 rounded-lg transition font-medium ${
              activeMenu === 'dashboard'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveMenu('create-order')}
            className={`w-full text-left px-6 py-3 rounded-lg transition font-medium ${
              activeMenu === 'create-order'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            ➕ Rendelés Lét.
          </button>
          <button
            onClick={() => setActiveMenu('stock')}
            className={`w-full text-left px-6 py-3 rounded-lg transition font-medium ${
              activeMenu === 'stock'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            📦 Raktár
          </button>
          <button
            onClick={() => setActiveMenu('clients')}
            className={`w-full text-left px-6 py-3 rounded-lg transition font-medium ${
              activeMenu === 'clients'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            👥 Ügyfelek
          </button>
          <button
            onClick={() => setActiveMenu('products')}
            className={`w-full text-left px-6 py-3 rounded-lg transition font-medium ${
              activeMenu === 'products'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            🛍️ Termékek
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 w-64">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
          >
            🚪 Kijelentkezés
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-md border-b border-gray-200 p-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800">
              {activeMenu === 'dashboard' && '📊 Dashboard'}
              {activeMenu === 'create-order' && '➕ Rendelés Létrehozása'}
              {activeMenu === 'stock' && '📦 Raktárkezelés'}
              {activeMenu === 'clients' && '👥 Ügyfelekezelés'}
              {activeMenu === 'products' && '🛍️ Termékkezelés'}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                {userInfo?.name}
              </span>
              <img
                src={`https://ui-avatars.com/api/?name=${userInfo?.name}&background=667eea&color=fff`}
                alt="Avatar"
                className="w-10 h-10 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg font-medium">
              {error}
            </div>
          )}

          {activeMenu === 'dashboard' && userInfo && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Teljes Rendelések</p>
                      <p className="text-4xl font-bold text-gray-800 mt-2">0</p>
                    </div>
                    <div className="text-4xl">📋</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Teljes Termékkészlet</p>
                      <p className="text-4xl font-bold text-gray-800 mt-2">0</p>
                    </div>
                    <div className="text-4xl">📦</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Ügyfelek</p>
                      <p className="text-4xl font-bold text-gray-800 mt-2">0</p>
                    </div>
                    <div className="text-4xl">👥</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Teljes Bevétel</p>
                      <p className="text-4xl font-bold text-gray-800 mt-2">$0</p>
                    </div>
                    <div className="text-4xl">💰</div>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">👤 Fiók Adatai</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Név</p>
                    <p className="text-lg font-semibold text-gray-800">{userInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">E-mail</p>
                    <p className="text-lg font-semibold text-gray-800">{userInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Telefonszám</p>
                    <p className="text-lg font-semibold text-gray-800">{userInfo.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Szerepkör</p>
                    <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {userInfo.role}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Csatlakozás Dátuma</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {new Date(userInfo.joined_at).toLocaleDateString('hu-HU')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">⚡ Gyors Műveletek</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium">
                    Profil Szerkesztése
                  </button>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium">
                    Jelszó Módosítása
                  </button>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium">
                    Fiók Törlése
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'create-order' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600">Rendelés létrehozás funkció - hamarosan</p>
            </div>
          )}

          {activeMenu === 'stock' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600">Raktárkezelés funkció - hamarosan</p>
            </div>
          )}

          {activeMenu === 'clients' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600">Ügyfelekezelés funkció - hamarosan</p>
            </div>
          )}

          {activeMenu === 'products' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600">Termékkezelés funkció - hamarosan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage
