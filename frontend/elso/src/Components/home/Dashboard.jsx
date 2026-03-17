function Dashboard({ userInfo, onNavigate }) {
  if (!userInfo) return null

  return (
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
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
            onClick={() => onNavigate?.('profile')}
            type="button"
          >
            Profil Szerkesztése
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
            onClick={() => alert('Jelszó módosítás: hamarosan')}
            type="button"
          >
            Jelszó Módosítása
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
            onClick={() => alert('Fiók törlés: hamarosan')}
            type="button"
          >
            Fiók Törlése
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

