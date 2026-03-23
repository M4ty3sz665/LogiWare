import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../utils/api'

const HUF = new Intl.NumberFormat('hu-HU', {
  style: 'currency',
  currency: 'HUF',
  maximumFractionDigits: 0,
})

function statusBadgeClass(status) {
  const s = String(status || '').toUpperCase()
  if (s === 'COMPLETED') return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (s === 'IN_PROGRESS') return 'bg-blue-50 text-blue-700 ring-blue-200'
  if (s === 'CANCELLED') return 'bg-red-50 text-red-700 ring-red-200'
  return 'bg-slate-50 text-slate-700 ring-slate-200'
}

function collectOrderItems(order) {
  if (Array.isArray(order?.order_items)) return order.order_items
  if (Array.isArray(order?.OrderItems)) return order.OrderItems
  if (Array.isArray(order?.items)) return order.items
  return []
}

function Cart() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await apiFetch('/order', { signal: controller.signal })
        setRows(Array.isArray(data) ? data : [])
      } catch (e) {
        if (e?.name !== 'AbortError') {
          setError(e?.message || 'Nem sikerült betölteni a kosarat.')
        }
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [])

  const orders = useMemo(() => {
    return rows.map((order) => {
      const items = collectOrderItems(order)
      const total = items.reduce((sum, item) => {
        const qty = Number(item?.amount || 0)
        const unit = Number(item?.unit_price_gross || 0)
        return sum + qty * unit
      }, 0)
      return {
        ...order,
        _items: items,
        _totalGross: total,
      }
    })
  }, [rows])

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Kosár</h3>
          <p className="mt-1 text-sm text-gray-500">
            Itt látod a rendelés összegzéseket: melyik rendelés mit és mennyit tartalmaz.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 space-y-4">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
            Betöltés...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
            Még nincs rendelés a kosár összegzéshez.
          </div>
        ) : (
          orders.map((order) => (
            <article key={order.order_number} className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-bold text-gray-900">
                  Rendelés #{order.order_number}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadgeClass(order.status)}`}>
                    {String(order.status || 'TBD').toUpperCase()}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {order.payment_status || 'not processed'}
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2">
                {order._items.length === 0 ? (
                  <div className="rounded-lg bg-white px-3 py-2 text-sm text-gray-600">
                    Nincs tétel ehhez a rendeléshez.
                  </div>
                ) : (
                  order._items.map((item) => {
                    const qty = Number(item?.amount || 0)
                    const unit = Number(item?.unit_price_gross || 0)
                    const lineTotal = qty * unit
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 gap-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-800 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                      >
                        <div>
                          <div className="font-semibold text-gray-900">
                            {item?.product?.name || `Termék #${item?.product_id}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            Kód: {item?.product?.product_code || '-'}
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-gray-700">
                          {qty} db
                        </div>
                        <div className="text-xs font-semibold text-gray-700">
                          {HUF.format(lineTotal)}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="mt-3 border-t border-gray-200 pt-3 text-right text-sm font-semibold text-gray-800">
                Összesen: <span className="text-base font-bold text-gray-900">{HUF.format(order._totalGross)}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}

export default Cart