function Dashboard({ userInfo, onNavigate }) {
  if (!userInfo) return null

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Teljes Rendelések</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">0</p>
            </div>
            <div className="text-4xl">📋</div>
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
        </div>
      </div>
    </div>
  )
}

export default Dashboard

