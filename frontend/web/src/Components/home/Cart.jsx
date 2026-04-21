import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch, isAbortError } from '../../utils/api'
import { EmptyState, LoadingState } from '../ui/StateBlocks.jsx'
import { useToast } from '../ToastProvider.jsx'
import { BTN_DANGER, BTN_OUTLINE_ICON } from '../ui/buttonStyles.js'

const HUF = new Intl.NumberFormat('hu-HU', {
  style: 'currency',
  currency: 'HUF',
  maximumFractionDigits: 0,
})

function formatWeightKg(value) {
  return `${Number(value || 0).toFixed(1)} kg`
}

function getPricePerTenthKg(pricePerKg) {
  return Math.floor(Number(pricePerKg || 0) / 10)
}

function statusBadgeClass(status) {
  const s = String(status || '').toUpperCase()
  if (s === 'COMPLETED') return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (s === 'IN_PROGRESS') return 'bg-blue-50 text-blue-700 ring-blue-200'
  if (s === 'CANCELLED') return 'bg-red-50 text-red-700 ring-red-200'
  return 'bg-slate-50 text-slate-700 ring-slate-200'
}

function statusLabelHu(status) {
  const s = String(status || '').toUpperCase()
  if (s === 'COMPLETED') return 'Teljesítve'
  if (s === 'IN_PROGRESS') return 'Folyamatban'
  if (s === 'CANCELLED') return 'Lemondva'
  return 'Függőben'
}

function paymentStatusHu(value) {
  const s = String(value || '').trim().toLowerCase()
  if (!s) return 'Nincs feldolgozva'
  if (s === 'not processed') return 'Nincs feldolgozva'
  if (s === 'processed') return 'Feldolgozva'
  return value
}

function collectOrderItems(order) {
  if (Array.isArray(order?.order_items)) return order.order_items
  if (Array.isArray(order?.OrderItems)) return order.OrderItems
  if (Array.isArray(order?.items)) return order.items
  return []
}

function Cart() {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedByOrder, setExpandedByOrder] = useState({})
  const [savingId, setSavingId] = useState(null)

  const load = useCallback(
    async (signal) => {
      setLoading(true)
      setError('')
      try {
        const data = await apiFetch('/order', { signal })
        setRows(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!isAbortError(e)) {
          setError(e?.message || 'Nem sikerült betölteni a kosarat.')
        }
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  const orders = useMemo(() => {
    return rows.map((order) => {
      const items = collectOrderItems(order)
      const total = items.reduce((sum, item) => {
        const qty = Number(item?.amount || 0)
        const unitPerTenthKg = getPricePerTenthKg(item?.unit_price_gross || 0)
        return sum + unitPerTenthKg * Math.round(qty * 10)
      }, 0)
      return {
        ...order,
        _items: items,
        _totalGross: total,
      }
    })
  }, [rows])

  const isExpanded = (orderNumber) => expandedByOrder[orderNumber] !== false

  const toggleExpanded = (orderNumber) => {
    setExpandedByOrder((prev) => ({
      ...prev,
      [orderNumber]: !(prev[orderNumber] !== false),
    }))
  }

  const cancelOrder = async (orderNumber, status) => {
    const s = String(status || '').toUpperCase()
    if (s === 'CANCELLED' || s === 'COMPLETED') return
    if (savingId) return
    const ok = window.confirm('Biztos lemondod? (készlet vissza lesz töltve)')
    if (!ok) return
    setSavingId(orderNumber)
    try {
      await apiFetch(`/order/${orderNumber}/status`, { method: 'PUT', body: { status: 'CANCELLED' } })
      toast.success('Rendelés lemondva.')
      await load()
    } catch (e) {
      toast.error(e?.message || 'Nem sikerült lemondani a rendelést.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Kosár</h3>
          <p className="mt-1 text-sm text-gray-500">
            Itt látod a rendeléseket kg alapú mennyiségekkel, 0.1 kg-os egységárral.
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
          <LoadingState message="Kosár betöltése..." />
        ) : orders.length === 0 ? (
          <EmptyState message="Még nincs rendelés a kosár összegzéshez." />
        ) : (
          orders.map((order) => (
            <article key={order.order_number} className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-bold text-gray-900">
                  Rendelés #{order.order_number}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadgeClass(order.status)}`}>
                    {statusLabelHu(order.status)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {paymentStatusHu(order.payment_status)}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(order.order_number)}
                    className={BTN_OUTLINE_ICON}
                    aria-label={isExpanded(order.order_number) ? 'Termékek elrejtése' : 'Termékek megjelenítése'}
                    title={isExpanded(order.order_number) ? 'Termékek elrejtése' : 'Termékek megjelenítése'}
                  >
                    <span className="text-sm leading-none">{isExpanded(order.order_number) ? '▾' : '▸'}</span>
                  </button>
                </div>
              </div>

              {isExpanded(order.order_number) && (
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {order._items.length === 0 ? (
                    <div className="rounded-lg bg-white px-3 py-2 text-sm text-gray-600">
                      Nincs tétel ehhez a rendeléshez.
                    </div>
                  ) : (
                    order._items.map((item) => {
                      const qty = Number(item?.amount || 0)
                      const unitPerTenthKg = getPricePerTenthKg(item?.unit_price_gross || 0)
                      const lineTotal = unitPerTenthKg * Math.round(qty * 10)
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
                            {formatWeightKg(qty)}
                          </div>
                          <div className="text-xs font-semibold text-gray-700">
                            {HUF.format(unitPerTenthKg)} / 0.1 kg, {HUF.format(lineTotal)}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
                <button
                  type="button"
                  onClick={() => cancelOrder(order.order_number, order.status)}
                  disabled={
                    savingId === order.order_number ||
                    String(order.status || '').toUpperCase() === 'CANCELLED' ||
                    String(order.status || '').toUpperCase() === 'COMPLETED'
                  }
                  className={BTN_DANGER}
                >
                  {savingId === order.order_number ? 'Lemondás...' : 'Lemondás'}
                </button>
                <div className="text-right text-sm font-semibold text-gray-800">
                  Összesen:{' '}
                  <span className="text-base font-bold text-gray-900">{HUF.format(order._totalGross)}</span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}

export default Cart