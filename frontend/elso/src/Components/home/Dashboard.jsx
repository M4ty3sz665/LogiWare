import { useEffect, useMemo, useState } from 'react'
import { apiFetch, isAbortError } from '../../utils/api'
import BadgeIcon from '../ui/BadgeIcon.jsx'

function collectOrderItems(order) {
  if (Array.isArray(order?.order_items)) return order.order_items
  if (Array.isArray(order?.OrderItems)) return order.OrderItems
  if (Array.isArray(order?.items)) return order.items
  return []
}

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

  const totalOrderedAmount = useMemo(() => {
    return rows.reduce((orderSum, order) => {
      const itemTotal = collectOrderItems(order).reduce((itemSum, item) => {
        return itemSum + Number(item?.amount || 0)
      }, 0)
      return orderSum + itemTotal
    }, 0)
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
              <p className="text-4xl font-bold text-gray-800 mt-2">{NUMBER.format(totalOrderedAmount)}</p>
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

