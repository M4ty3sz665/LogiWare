import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../utils/api'
import { useToast } from '../ToastProvider.jsx'
import { SkeletonTable } from '../ui/Skeleton.jsx'

function badge(status) {
  const s = String(status || '').toUpperCase()
  if (s === 'COMPLETED') return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (s === 'IN_PROGRESS') return 'bg-blue-50 text-blue-700 ring-blue-200'
  if (s === 'CANCELLED') return 'bg-red-50 text-red-700 ring-red-200'
  return 'bg-slate-50 text-slate-700 ring-slate-200'
}

function Orders() {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [savingId, setSavingId] = useState(null)

  const load = async (signal) => {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/order', { signal })
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Nem sikerült betölteni a rendeléseket.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((o) => {
      const company = o.client_company?.company_name || ''
      return (
        String(o.order_number).includes(q) ||
        String(o.status || '').toLowerCase().includes(q) ||
        String(o.payment_status || '').toLowerCase().includes(q) ||
        company.toLowerCase().includes(q)
      )
    })
  }, [rows, query])

  const setStatus = async (orderNumber, status) => {
    if (savingId) return
    setSavingId(orderNumber)
    try {
      await apiFetch(`/order/${orderNumber}/status`, { method: 'PUT', body: { status } })
      toast.success('Státusz frissítve.')
      await load()
    } catch (e) {
      toast.error(e?.message || 'Nem sikerült menteni.')
    } finally {
      setSavingId(null)
    }
  }

  const setPayment = async (orderNumber, payment_status) => {
    if (savingId) return
    setSavingId(orderNumber)
    try {
      await apiFetch(`/order/${orderNumber}/payment`, { method: 'PUT', body: { payment_status } })
      toast.success('Fizetés státusz frissítve.')
      await load()
    } catch (e) {
      toast.error(e?.message || 'Nem sikerült menteni.')
    } finally {
      setSavingId(null)
    }
  }

  const cancelOrder = async (orderNumber) => {
    const ok = window.confirm('Biztos lemondod? (készlet vissza lesz töltve)')
    if (!ok) return
    await setStatus(orderNumber, 'CANCELLED')
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Rendelések</h3>
          <p className="mt-1 text-sm text-gray-500">
            Státusz flow: TBD → IN_PROGRESS → COMPLETED. Lemondás: CANCELLED.
          </p>
        </div>
        <div className="w-full sm:w-80">
          <label className="block text-xs font-semibold tracking-wide text-gray-600">Keresés</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="order#, cég, státusz..."
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
        {loading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                Rendelés #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                Ügyfél cég
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                Státusz
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                Fizetés
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600">
                Művelet
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-sm text-gray-600" colSpan={5}>
                  Betöltés...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-600" colSpan={5}>
                  Nincs rendelés.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.order_number} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{o.order_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {o.client_company?.company_name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badge(
                        o.status,
                      )}`}
                    >
                      {String(o.status || 'TBD').toUpperCase()}
                    </span>
                    <div className="mt-2">
                      <select
                        value={String(o.status || 'TBD').toUpperCase()}
                        disabled={savingId === o.order_number}
                        onChange={(e) => setStatus(o.order_number, e.target.value)}
                        className="w-44 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="TBD">TBD</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    <div className="text-xs font-semibold text-gray-700">
                      {o.payment_status || 'not processed'}
                    </div>
                    <div className="mt-2">
                      <select
                        value={o.payment_status || 'not processed'}
                        disabled={savingId === o.order_number}
                        onChange={(e) => setPayment(o.order_number, e.target.value)}
                        className="w-44 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="not processed">not processed</option>
                        <option value="paid">paid</option>
                        <option value="overdue">overdue</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={savingId === o.order_number}
                      onClick={() => cancelOrder(o.order_number)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Lemondás
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        )}
      </div>
    </div>
  )
}

export default Orders

