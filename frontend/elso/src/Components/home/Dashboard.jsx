import { useEffect, useMemo, useState } from 'react'
import { apiFetch, isAbortError } from '../../utils/api'
import BadgeIcon from '../ui/BadgeIcon.jsx'

const NUMBER = new Intl.NumberFormat('hu-HU')

function Dashboard({ userInfo, onNavigate }) {
  const [rows, setRows] = useState([])

  useEffect(() => {
    const controller = new AbortController()

    async function loadOrders() {
      try {
        const data = await apiFetch('/order', { signal: controller.signal })
        setRows(Array.isArray(data) ? data : [])
      } catch (error) {
        if (!isAbortError(error)) {
          setRows([])
        }
      }
    }

    loadOrders()
    return () => controller.abort()
  }, [])

  const totalOrders = useMemo(() => {
    const orderIds = new Set(
      rows
        .map((order) => order?.order_number ?? order?.id ?? null)
        .filter((value) => value !== null && value !== undefined)
    )

    return orderIds.size
  }, [rows])

  if (!userInfo) return null

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Teljes Rendelések</p>
              <p className="text-4xl font-bold text-gray-800 mt-2">{NUMBER.format(totalOrders)}</p>
            </div>
            <BadgeIcon icon="orders" tone="amber" size="lg" />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="mb-4 inline-flex items-center gap-3 text-xl font-bold text-gray-800">
          <BadgeIcon icon="profile" tone="slate" size="md" />
          <span>Fiók Adatai</span>
        </h3>
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

