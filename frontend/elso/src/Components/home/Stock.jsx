import { useEffect, useMemo, useState } from 'react'

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('hu-HU')
}

function Stock() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => {
      const name = r.product?.name || ''
      const code = r.product?.product_code || ''
      return (
        String(r.id).includes(q) ||
        String(r.item_id).includes(q) ||
        name.toLowerCase().includes(q) ||
        code.toLowerCase().includes(q)
      )
    })
  }, [rows, query])

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/stock', {
          method: 'GET',
          headers: token ? { Authorization: token } : undefined,
          signal: controller.signal,
        })

        if (!res.ok) {
          const text = await res.text().catch(() => '')
          throw new Error(text || `HTTP ${res.status}`)
        }

        const data = await res.json()
        setRows(Array.isArray(data) ? data : [])
      } catch (e) {
        if (e?.name !== 'AbortError') {
          setError(e?.message || 'Nem sikerült betölteni a raktár adatokat.')
        }
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Raktár</h3>
          <p className="mt-1 text-sm text-gray-500">
            Készlet tételek listája backendről betöltve.
          </p>
        </div>

        <div className="w-full sm:w-80">
          <label className="block text-xs font-semibold tracking-wide text-gray-600">
            Keresés
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="név, kód, id..."
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                Termék
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                Kód
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                Mennyiség
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                Felvéve
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
                  Nincs megjeleníthető tétel.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {r.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {r.product?.name || `Item #${r.item_id}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {r.product?.product_code || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {r.amount}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatDate(r.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Stock

