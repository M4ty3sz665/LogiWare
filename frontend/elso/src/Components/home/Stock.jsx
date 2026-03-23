import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../utils/api'

function downloadCsv(filename, rows) {
  const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function Stock() {
  const [rows, setRows] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const [onlyNegative, setOnlyNegative] = useState(false)
  const [onlyZero, setOnlyZero] = useState(false)
  const [onlyLow, setOnlyLow] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [stockData, productsData] = await Promise.all([
          apiFetch('/stock', { signal: controller.signal }),
          apiFetch('/product', { auth: false, signal: controller.signal }),
        ])

        setRows(Array.isArray(stockData) ? stockData : [])
        setProducts(Array.isArray(productsData) ? productsData : [])
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

  const stockByItemId = useMemo(() => {
    const map = new Map()
    for (const r of rows) {
      const itemId = r.item_id ?? r.product?.id ?? null
      if (itemId == null) continue
      map.set(itemId, (map.get(itemId) || 0) + Number(r.amount || 0))
    }
    return map
  }, [rows])

  const summaryRows = useMemo(() => {
    const list = (products || []).map((p) => {
      const amount = stockByItemId.get(p.id) || 0
      const low = Number(p.low_stock_threshold || 0)
      return {
        id: p.id,
        name: p.name,
        code: p.product_code,
        amount,
        low,
        isLow: low > 0 && amount <= low,
      }
    })

    const q = query.trim().toLowerCase()
    const out = list.filter((r) => {
      if (onlyNegative && r.amount >= 0) return false
      if (onlyZero && r.amount !== 0) return false
      if (onlyLow && !r.isLow) return false
      if (!q) return true
      return (
        String(r.id).includes(q) ||
        String(r.code || '').toLowerCase().includes(q) ||
        String(r.name || '').toLowerCase().includes(q)
      )
    })
    out.sort((a, b) => String(a.name).localeCompare(String(b.name), 'hu'))
    return out
  }, [products, stockByItemId, query, onlyNegative, onlyZero, onlyLow])

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Raktár</h3>
          <p className="mt-1 text-sm text-gray-500">
            Összesített készlet nézet.
          </p>
        </div>

        <div className="w-full sm:w-96">
          <label className="block text-xs font-semibold tracking-wide text-gray-600">Keresés</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="név, kód, id, típus..."
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={onlyNegative}
                onChange={(e) => setOnlyNegative(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              csak negatív
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={onlyZero}
                onChange={(e) => setOnlyZero(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              csak 0
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={onlyLow}
                onChange={(e) => setOnlyLow(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              csak low
            </label>
          </div>
          <button
            type="button"
            onClick={() =>
              downloadCsv('stock-summary.csv', [
                ['product_id', 'name', 'code', 'amount', 'low_threshold'],
                ...summaryRows.map((r) => [r.id, r.name, r.code, r.amount, r.low]),
              ])
            }
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
          >
            CSV export
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                  Termék
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                  Kód
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600">
                  Készlet
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600">
                  Low
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-sm text-gray-600" colSpan={4}>
                    Betöltés...
                  </td>
                </tr>
              ) : summaryRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-600" colSpan={4}>
                    Nincs megjeleníthető sor.
                  </td>
                </tr>
              ) : (
                summaryRows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {r.name}
                      {r.isLow && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                          alacsony
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.code || '-'}</td>
                    <td className={`px-4 py-3 text-sm font-semibold text-right tabular-nums ${r.isLow ? 'text-red-700' : 'text-gray-900'}`}>
                      {r.amount}
                    </td>
                    <td className="px-4 py-3 text-sm text-right tabular-nums text-gray-700">
                      {r.low}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Stock

