import { useEffect, useMemo, useState } from 'react'

function Products() {
  const [products, setProducts] = useState([])
  const [stockRows, setStockRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showOutOfStock, setShowOutOfStock] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('token')

        const [productsRes, stockRes] = await Promise.all([
          fetch('/api/product', {
            method: 'GET',
            signal: controller.signal,
          }),
          fetch('/api/stock', {
            method: 'GET',
            headers: token ? { Authorization: token } : undefined,
            signal: controller.signal,
          }),
        ])

        if (!productsRes.ok) {
          const text = await productsRes.text().catch(() => '')
          throw new Error(text || `HTTP ${productsRes.status}`)
        }
        if (!stockRes.ok) {
          const text = await stockRes.text().catch(() => '')
          throw new Error(text || `HTTP ${stockRes.status}`)
        }

        const productsData = await productsRes.json()
        const stockData = await stockRes.json()
        setProducts(Array.isArray(productsData) ? productsData : [])
        setStockRows(Array.isArray(stockData) ? stockData : [])
      } catch (e) {
        if (e?.name !== 'AbortError') {
          setError(e?.message || 'Nem sikerült betölteni a termékeket.')
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
    for (const r of stockRows) {
      const itemId = r.item_id ?? r.product?.id ?? null
      if (itemId == null) continue
      map.set(itemId, (map.get(itemId) || 0) + Number(r.amount || 0))
    }
    return map
  }, [stockRows])

  const viewRows = useMemo(() => {
    const list = (products || []).map((p) => ({
      key: p.id,
      productId: p.id,
      name: p.name,
      code: p.product_code || '-',
      amount: stockByItemId.get(p.id) || 0,
    }))
    list.sort((a, b) => String(a.name).localeCompare(String(b.name), 'hu'))
    return list
  }, [products, stockByItemId])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return viewRows.filter((p) => {
      if (!showOutOfStock && p.amount <= 0) return false
      if (!q) return true
      return (
        String(p.productId ?? '').toLowerCase().includes(q) ||
        String(p.code ?? '').toLowerCase().includes(q) ||
        String(p.name ?? '').toLowerCase().includes(q)
      )
    })
  }, [products, query, showOutOfStock])

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Termékek</h3>
          <p className="mt-1 text-sm text-gray-500">
            Termék törzs + készlet (raktárból összesítve).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="w-full sm:w-72">
            <label className="block text-xs font-semibold tracking-wide text-gray-600">
              Keresés
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="név, kód..."
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700 select-none">
            <input
              type="checkbox"
              checked={showOutOfStock}
              onChange={(e) => setShowOutOfStock(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Mutasd a 0 készletet is
          </label>
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
                Termék
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                Kód
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600">
                Készlet
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-sm text-gray-600" colSpan={3}>
                  Betöltés...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-600" colSpan={3}>
                  Nincs megjeleníthető termék.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.key} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {p.code || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right tabular-nums">
                    {p.amount}
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

export default Products

