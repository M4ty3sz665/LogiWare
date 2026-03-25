import { useEffect, useMemo, useState } from 'react'
import { apiFetch, isAbortError } from '../../utils/api'
import { useToast } from '../ToastProvider.jsx'

const HUF = new Intl.NumberFormat('hu-HU', {
  style: 'currency',
  currency: 'HUF',
  maximumFractionDigits: 0,
})

function clampQty(n) {
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(999, n))
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

function CreateOrder() {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [orderQtyById, setOrderQtyById] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [products, setProducts] = useState([])
  const [stock, setStock] = useState([])

  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [dueDate, setDueDate] = useState('')
  const [draftSavedAt, setDraftSavedAt] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [p, s] = await Promise.all([
          apiFetch('/product', { auth: false, signal: controller.signal }),
          apiFetch('/stock', { signal: controller.signal }),
        ])
        setProducts(Array.isArray(p) ? p : [])
        setStock(Array.isArray(s) ? s : [])
      } catch (e) {
        if (!isAbortError(e)) {
          setError(e?.message || 'Nem sikerült betölteni az adatokat.')
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
    for (const r of stock) {
      const itemId = r.item_id ?? r.product?.id ?? null
      if (itemId == null) continue
      map.set(itemId, (map.get(itemId) || 0) + Number(r.amount || 0))
    }
    return map
  }, [stock])

  const stockItems = useMemo(() => {
    return (products || [])
      .map((p) => ({
        id: p.id,
        name: p.name,
        code: p.product_code,
        price: Number(p.price_gross || 0),
        available: stockByItemId.get(p.id) || 0,
      }))
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'hu'))
  }, [products, stockByItemId])

  const filteredStock = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return stockItems
    return stockItems.filter((i) => i.name.toLowerCase().includes(q) || String(i.code || '').toLowerCase().includes(q))
  }, [query, stockItems])

  const orderItems = useMemo(() => {
    const items = []
    for (const item of stockItems) {
      const qty = orderQtyById[item.id] || 0
      if (qty > 0) items.push({ ...item, qty })
    }
    return items
  }, [orderQtyById, stockItems])

  const total = useMemo(() => {
    return orderItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  }, [orderItems])

  const addOne = (id) => {
    setOrderQtyById((prev) => {
      const next = { ...prev }
      next[id] = clampQty((next[id] || 0) + 1)
      return next
    })
  }

  const removeOne = (id) => {
    setOrderQtyById((prev) => {
      const next = { ...prev }
      const current = next[id] || 0
      const updated = clampQty(current - 1)
      if (updated <= 0) delete next[id]
      else next[id] = updated
      return next
    })
  }

  const setQty = (id, qty) => {
    const parsed = clampQty(Number(qty))
    setOrderQtyById((prev) => {
      const next = { ...prev }
      if (parsed <= 0) delete next[id]
      else next[id] = parsed
      return next
    })
  }

  const validateOrder = () => {
    if (orderItems.length === 0) {
      toast.error('Adj legalább egy tételt a rendeléshez.')
      return false
    }
    if (!dueDate) {
      toast.error('Adj meg teljesítési dátumot.')
      return false
    }

    for (const it of orderItems) {
      if (it.qty > it.available) {
        toast.error(`Nincs elég készlet: ${it.name} (max ${it.available})`)
        return false
      }
    }

    return true
  }

  const handleSaveDraftCsv = () => {
    if (!validateOrder()) return

    const now = new Date()
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`

    downloadCsv(`order-draft-${stamp}.csv`, [
      ['type', 'payment_method', 'due_date', 'total_huf', 'saved_at'],
      ['draft', paymentMethod, dueDate, total, now.toISOString()],
      [],
      ['product_id', 'product_name', 'product_code', 'qty', 'unit_price_huf', 'line_total_huf'],
      ...orderItems.map((i) => [i.id, i.name, i.code, i.qty, i.price, i.price * i.qty]),
    ])

    setDraftSavedAt(now.toLocaleString('hu-HU'))
    toast.success('Rendelés piszkozat CSV mentve. Még nincs adatbázisba küldve.')
  }

  const handleFinalizeOrder = async () => {
    if (isSubmitting) return
    if (!validateOrder()) return

    setIsSubmitting(true)
    try {
      const payload = {
        payment_method: paymentMethod,
        due_date: dueDate,
        items: orderItems.map((i) => ({ product_id: i.id, amount: i.qty })),
      }
      const res = await apiFetch('/order', { method: 'POST', body: payload })
      toast.success(`Rendelés véglegesítve (#${res?.order_number}).`)
      setOrderQtyById({})
      setQuery('')
      setDraftSavedAt('')
      const s = await apiFetch('/stock')
      setStock(Array.isArray(s) ? s : [])
    } catch (e) {
      toast.error(e?.message || 'Nem sikerült a rendelés véglegesítése.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Rendelés létrehozása</h3>
          <p className="mt-1 text-sm text-gray-500">
            Válassz zöldséget vagy gyümölcsöt az áruk közül, jobb oldalt áll össze a kosár.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <label className="block text-xs font-semibold tracking-wide text-gray-600">
            Keresés
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="pl. alma, paradicsom..."
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
          <div className="text-xs font-bold tracking-wider text-gray-700">RENDELÉS ADATOK</div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-600">Fizetési mód</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">készpénz</option>
                <option value="card">kártya</option>
                <option value="transfer">átutalás</option>
                <option value="invoice">számlás fizetés</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-600">Teljesítési dátum</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
              <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-gray-200 pb-3">
                <div className="text-xs font-bold tracking-wider text-gray-700">Kosár</div>
                <div className="text-xs font-bold tracking-wider text-gray-700">ÁR</div>
              </div>

              <div className="mt-3 space-y-2">
                {filteredStock.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg bg-white px-3 py-2 shadow-sm"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-gray-800">
                        {item.name}{' '}
                        <span className="text-xs text-gray-500">({item.code})</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Készlet: <span className="font-semibold">{item.available}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="whitespace-nowrap text-sm font-semibold text-gray-700">
                        {HUF.format(item.price)}
                      </div>
                      <button
                        type="button"
                        onClick={() => addOne(item.id)}
                        disabled={item.available <= 0}
                        className="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 transition"
                      >
                        hozzáad
                      </button>
                    </div>
                  </div>
                ))}

                {filteredStock.length === 0 && (
                  <div className="rounded-lg bg-white px-3 py-3 text-sm text-gray-600">
                    Nincs találat.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
              <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-gray-200 pb-3">
                <div className="text-xs font-bold tracking-wider text-gray-700">KOSÁR</div>
                <div className="text-xs font-bold tracking-wider text-gray-700">ÁR</div>
              </div>

              <div className="mt-3 space-y-2">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg bg-white px-3 py-2 shadow-sm"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-gray-800">{item.name}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-gray-500">Menny.</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={999}
                          value={item.qty}
                          onChange={(e) => setQty(item.id, e.target.value)}
                          className="w-20 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeOne(item.id)}
                          className="rounded-full bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-300 transition"
                        >
                          töröl
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="whitespace-nowrap text-sm font-semibold text-gray-700">{HUF.format(item.price)}</div>
                      <div className="mt-1 whitespace-nowrap text-xs text-gray-500">
                        {HUF.format(item.price * item.qty)}
                      </div>
                    </div>
                  </div>
                ))}

                {orderItems.length === 0 && (
                  <div className="rounded-lg bg-white px-3 py-6 text-center text-sm text-gray-600">
                    Még nincs tétel a kosárban.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="text-sm font-semibold text-gray-700">
              Össz ár:{' '}
              <span className="ml-1 text-lg font-bold text-gray-900">{HUF.format(total)}</span>
            </div>
            {draftSavedAt && (
              <div className="text-xs text-gray-500">
                Utolsó CSV mentés: {draftSavedAt}
              </div>
            )}
            <button
              type="button"
              onClick={handleSaveDraftCsv}
              disabled={orderItems.length === 0 || loading}
              className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              CSV mentés (piszkozat)
            </button>
            <button
              type="button"
              onClick={handleFinalizeOrder}
              disabled={orderItems.length === 0 || isSubmitting || loading}
              className="sm:ml-6 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Véglegesítés...' : 'Rendelés véglegesítése'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateOrder

