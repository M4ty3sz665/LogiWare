import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../utils/api'

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('hu-HU')
}

function formatDateTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString('hu-HU')
}

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
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const [activeTab, setActiveTab] = useState('summary') // summary | items | movements
  const [onlyNegative, setOnlyNegative] = useState(false)
  const [onlyZero, setOnlyZero] = useState(false)
  const [onlyLow, setOnlyLow] = useState(false)

  const [moveType, setMoveType] = useState('IN')
  const [moveProductId, setMoveProductId] = useState('')
  const [moveAmount, setMoveAmount] = useState('')
  const [moveNote, setMoveNote] = useState('')
  const [moveSubmitting, setMoveSubmitting] = useState(false)
  const [moveError, setMoveError] = useState('')
  const [moveSuccess, setMoveSuccess] = useState('')

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => {
      const name = r.product_name || r.product?.name || ''
      const code = r.product_code || r.product?.product_code || ''
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
        const [stockData, productsData, movementsData] = await Promise.all([
          apiFetch('/stock', { signal: controller.signal }),
          apiFetch('/product', { auth: false, signal: controller.signal }),
          apiFetch('/stockmovement', { signal: controller.signal }),
        ])

        setRows(Array.isArray(stockData) ? stockData : [])
        setProducts(Array.isArray(productsData) ? productsData : [])
        setMovements(Array.isArray(movementsData) ? movementsData : [])
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

  const filteredMovements = useMemo(() => {
    const q = query.trim().toLowerCase()
    const from = fromDate ? new Date(fromDate) : null
    const to = toDate ? new Date(toDate + 'T23:59:59') : null

    return (movements || []).filter((m) => {
      const time = m.time_of_movement ? new Date(m.time_of_movement) : null
      if (from && time && time < from) return false
      if (to && time && time > to) return false

      const p = m.stock?.product
      const name = p?.name || ''
      const code = p?.product_code || ''
      const note = m.note || ''

      if (!q) return true
      return (
        String(m.id).includes(q) ||
        String(m.movement_type || '').toLowerCase().includes(q) ||
        String(name).toLowerCase().includes(q) ||
        String(code).toLowerCase().includes(q) ||
        String(note).toLowerCase().includes(q)
      )
    })
  }, [movements, query, fromDate, toDate])

  const submitMove = async (e) => {
    e.preventDefault()
    if (moveSubmitting) return
    setMoveError('')
    setMoveSuccess('')

    const productId = Number(moveProductId)
    const amount = Number(moveAmount)
    if (!productId) {
      setMoveError('Válassz terméket.')
      return
    }
    if (!Number.isFinite(amount) || amount < 0) {
      setMoveError('A mennyiség legyen 0 vagy nagyobb szám.')
      return
    }
    if (moveType !== 'ADJUST' && amount === 0) {
      setMoveError('IN/OUT esetén a mennyiség legyen > 0.')
      return
    }

    setMoveSubmitting(true)
    try {
      await apiFetch('/inventory/move', {
        method: 'POST',
        body: { product_id: productId, type: moveType, amount, note: moveNote },
      })

      setMoveSuccess('Mentve.')
      setMoveAmount('')
      setMoveNote('')

      // refresh stock + movements
      const [stockData, movementsData] = await Promise.all([
        apiFetch('/stock'),
        apiFetch('/stockmovement'),
      ])
      setRows(Array.isArray(stockData) ? stockData : [])
      setMovements(Array.isArray(movementsData) ? movementsData : [])
    } catch (err) {
      setMoveError(err?.message || 'Nem sikerült menteni.')
    } finally {
      setMoveSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Raktár</h3>
          <p className="mt-1 text-sm text-gray-500">
            Összesített készlet, készlet tételek és mozgások.
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-xl bg-gray-100 p-1">
            {[
              { id: 'summary', label: 'Összesített' },
              { id: 'items', label: 'Tételek' },
              { id: 'movements', label: 'Mozgások' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === t.id ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'summary' && (
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
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {activeTab === 'summary' && (
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
            )}

            {activeTab === 'items' && (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
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
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">
                            {r.product_name || r.product?.name || `Item #${r.item_id}`}
                            {r.missing_product && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                                nincs hozzá product
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {r.product_code || r.product?.product_code || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{r.amount}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatDate(r.created_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'movements' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end sm:justify-between">
                  <div className="flex gap-3">
                    <div>
                      <label className="block text-xs font-semibold tracking-wide text-gray-600">Tól</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="mt-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-wide text-gray-600">Ig</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="mt-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                          Idő
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                          Típus
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                          Termék
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600">
                          Mennyiség
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                          Megjegyzés
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {loading ? (
                        <tr>
                          <td className="px-4 py-4 text-sm text-gray-600" colSpan={6}>
                            Betöltés...
                          </td>
                        </tr>
                      ) : filteredMovements.length === 0 ? (
                        <tr>
                          <td className="px-4 py-6 text-sm text-gray-600" colSpan={6}>
                            Nincs megjeleníthető mozgás.
                          </td>
                        </tr>
                      ) : (
                        filteredMovements.map((m) => {
                          const p = m.stock?.product
                          const amt = Number(m.amount || 0)
                          return (
                            <tr key={m.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.id}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {formatDateTime(m.time_of_movement)}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                {m.movement_type}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-800">
                                {p?.name || `Stock #${m.stock_id}`}
                                {p?.product_code ? (
                                  <span className="ml-2 text-xs text-gray-500">({p.product_code})</span>
                                ) : null}
                              </td>
                              <td className={`px-4 py-3 text-sm font-semibold text-right tabular-nums ${amt < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                                {amt}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">{m.note || '-'}</td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h4 className="text-sm font-bold text-gray-900">Készlet művelet</h4>
              <p className="mt-1 text-xs text-gray-500">
                Bevételezés (IN), kiadás (OUT) vagy leltár korrekció (ADJUST).
              </p>

              {moveError && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {moveError}
                </div>
              )}
              {moveSuccess && (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {moveSuccess}
                </div>
              )}

              <form onSubmit={submitMove} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold tracking-wide text-gray-600">Típus</label>
                  <select
                    value={moveType}
                    onChange={(e) => setMoveType(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IN">IN – bevételezés</option>
                    <option value="OUT">OUT – kiadás</option>
                    <option value="ADJUST">ADJUST – korrekció (beállít)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wide text-gray-600">Termék</label>
                  <select
                    value={moveProductId}
                    onChange={(e) => setMoveProductId(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— válassz —</option>
                    {products
                      .slice()
                      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'hu'))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.product_code})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wide text-gray-600">
                    {moveType === 'ADJUST' ? 'Új készlet (összesen)' : 'Mennyiség'}
                  </label>
                  <input
                    inputMode="numeric"
                    value={moveAmount}
                    onChange={(e) => setMoveAmount(e.target.value)}
                    placeholder={moveType === 'ADJUST' ? 'pl. 10' : 'pl. 5'}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wide text-gray-600">Megjegyzés</label>
                  <input
                    value={moveNote}
                    onChange={(e) => setMoveNote(e.target.value)}
                    placeholder="pl. bevételezés #123"
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={moveSubmitting}
                  className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {moveSubmitting ? 'Mentés...' : 'Mentés'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stock

