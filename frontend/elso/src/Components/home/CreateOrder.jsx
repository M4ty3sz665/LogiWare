import { useMemo, useState } from 'react'

const HUF = new Intl.NumberFormat('hu-HU', {
  style: 'currency',
  currency: 'HUF',
  maximumFractionDigits: 0,
})

const initialStockItems = [
  { id: 'pillowcase-flamingo', name: 'Flamingo Print Pillow Case', price: 6000 },
  { id: 'pillowcase-gold', name: 'Gold Foil Pillow Case', price: 6500 },
  { id: 'sheet-polka', name: 'Polka Dots Fitted Sheet', price: 8000 },
  { id: 'sheet-flamingo', name: 'Flamingo Print Pillow Case (XL)', price: 7200 },
  { id: 'sheet-gold', name: 'Gold Foil Pillow Case (XL)', price: 7800 },
  { id: 'sheet-polka-2', name: 'Polka Dots Fitted Sheet (King)', price: 12000 },
]

function clampQty(n) {
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(999, n))
}

function CreateOrder() {
  const [query, setQuery] = useState('')
  const [orderQtyById, setOrderQtyById] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredStock = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return initialStockItems
    return initialStockItems.filter((i) => i.name.toLowerCase().includes(q))
  }, [query])

  const orderItems = useMemo(() => {
    const items = []
    for (const item of initialStockItems) {
      const qty = orderQtyById[item.id] || 0
      if (qty > 0) items.push({ ...item, qty })
    }
    return items
  }, [orderQtyById])

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
      if (updated <= 0) {
        delete next[id]
      } else {
        next[id] = updated
      }
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

  const handleCreate = async () => {
    if (orderItems.length === 0 || isSubmitting) return
    setIsSubmitting(true)

    try {
      // Később ide jön az API hívás. Most csak szimuláljuk.
      await new Promise((r) => setTimeout(r, 650))
      alert('Rendelés létrehozva (demo).')
      setOrderQtyById({})
      setQuery('')
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
            Készletből adj hozzá tételeket, jobb oldalt áll össze a rendelés.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <label className="block text-xs font-semibold tracking-wide text-gray-600">
            Keresés
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="termék név..."
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Stock */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
          <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-gray-200 pb-3">
            <div className="text-xs font-bold tracking-wider text-gray-700">
              STOCK ITEMS
            </div>
            <div className="text-xs font-bold tracking-wider text-gray-700">PRICE</div>
          </div>

          <div className="mt-3 space-y-2">
            {filteredStock.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg bg-white px-3 py-2 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-gray-800">
                    {item.name}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="whitespace-nowrap text-sm font-semibold text-gray-700">
                    {HUF.format(item.price)}
                  </div>
                  <button
                    type="button"
                    onClick={() => addOne(item.id)}
                    className="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 transition"
                  >
                    add
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

        {/* Order */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
          <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-gray-200 pb-3">
            <div className="text-xs font-bold tracking-wider text-gray-700">
              ORDER ITEMS
            </div>
            <div className="text-xs font-bold tracking-wider text-gray-700">PRICE</div>
          </div>

          <div className="mt-3 space-y-2">
            {orderItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg bg-white px-3 py-2 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-gray-800">
                    {item.name}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Qty</span>
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
                      remove
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="whitespace-nowrap text-sm font-semibold text-gray-700">
                    {HUF.format(item.price)}
                  </div>
                  <div className="mt-1 whitespace-nowrap text-xs text-gray-500">
                    {HUF.format(item.price * item.qty)}
                  </div>
                </div>
              </div>
            ))}

            {orderItems.length === 0 && (
              <div className="rounded-lg bg-white px-3 py-6 text-center text-sm text-gray-600">
                Még nincs tétel a rendelésben.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="text-sm font-semibold text-gray-700">
          Össz ár:{' '}
          <span className="ml-1 text-lg font-bold text-gray-900">
            {HUF.format(total)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={orderItems.length === 0 || isSubmitting}
          className="sm:ml-6 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Létrehozás...' : 'Létrehozás'}
        </button>
      </div>
    </div>
  )
}

export default CreateOrder

