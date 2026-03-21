import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../utils/api'
import { useToast } from '../ToastProvider.jsx'

function money(value) {
  if (value == null || value === '') return '-'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return new Intl.NumberFormat('hu-HU').format(n)
}

function Products() {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showOutOfStock, setShowOutOfStock] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null) // product or null
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    name: '',
    product_code: '',
    price_net: '',
    price_gross: '',
    vat_rate: '',
    supplier_id: '',
    low_stock_threshold: '0',
  })

  useEffect(() => {
    const controller = new AbortController()

    async function loadAll() {
      setLoading(true)
      setError('')
      try {
        const [productsData, suppliersData] = await Promise.all([
          apiFetch('/product', { auth: false, signal: controller.signal }),
          apiFetch('/supplier', { signal: controller.signal }),
        ])
        console.log('DEBUG: productsData', productsData)
        setProducts(Array.isArray(productsData) ? productsData : [])
        setSuppliers(Array.isArray(suppliersData) ? suppliersData : [])
      } catch (e) {
        if (e?.name !== 'AbortError') {
          setError(e?.message || 'Nem sikerült betölteni a termékeket.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadAll()
    return () => controller.abort()
  }, [])

  const supplierById = useMemo(() => {
    const m = new Map()
    for (const s of suppliers) m.set(s.id, s)
    return m
  }, [suppliers])

  const viewRows = useMemo(() => {
    const list = (products || []).map((p) => ({
      key: p.id,
      productId: p.id,
      name: p.name,
      code: p.product_code || '-',
      amount: 0, // nincs stockByItemId, default 0
      low: Number(p.low_stock_threshold || 0),
      supplierName: supplierById.get(p.supplier_id)?.company_name || '-',
      price_net: p.price_net,
      price_gross: p.price_gross,
      vat_rate: p.vat_rate,
    }))
    list.sort((a, b) => String(a.name).localeCompare(String(b.name), 'hu'))
    return list
  }, [products, supplierById])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return viewRows.filter((p) => {
      // Minden termék látszódjon, ne szűrje ki a 0 készletet
      if (!q) return true
      return (
        String(p.productId ?? '').toLowerCase().includes(q) ||
        String(p.code ?? '').toLowerCase().includes(q) ||
        String(p.name ?? '').toLowerCase().includes(q) ||
        String(p.supplierName ?? '').toLowerCase().includes(q)
      )
    })
  }, [viewRows, query])

  const openCreate = () => {
    setEditing(null)
    setFormError('')
    setForm({
      name: '',
      product_code: '',
      price_net: '',
      price_gross: '',
      vat_rate: '',
      supplier_id: '',
      low_stock_threshold: '0',
    })
    setShowForm(true)
  }

  const openEdit = (productId) => {
    const p = products.find((x) => x.id === productId)
    if (!p) return
    setEditing(p)
    setFormError('')
    setForm({
      name: p.name ?? '',
      product_code: p.product_code ?? '',
      price_net: p.price_net ?? '',
      price_gross: p.price_gross ?? '',
      vat_rate: p.vat_rate ?? '',
      supplier_id: p.supplier_id ?? '',
      low_stock_threshold: String(p.low_stock_threshold ?? 0),
    })
    setShowForm(true)
  }

  const saveProduct = async (e) => {
    e.preventDefault()
    if (saving) return
    setFormError('')

    if (!form.name || !form.product_code) {
      setFormError('Név és kód kötelező.')
      return
    }

    const payload = {
      name: String(form.name).trim(),
      product_code: String(form.product_code).trim(),
      price_net: Number(form.price_net),
      price_gross: Number(form.price_gross),
      vat_rate: Number(form.vat_rate),
      supplier_id: form.supplier_id === '' ? null : Number(form.supplier_id),
      low_stock_threshold: Number(form.low_stock_threshold || 0),
    }

    if (!Number.isFinite(payload.price_net) || !Number.isFinite(payload.price_gross) || !Number.isFinite(payload.vat_rate)) {
      setFormError('Árak és ÁFA csak szám lehet.')
      return
    }
    if (!Number.isFinite(payload.low_stock_threshold) || payload.low_stock_threshold < 0) {
      setFormError('Low-stock küszöb legyen 0 vagy nagyobb.')
      return
    }

    setSaving(true)
    try {
      const url = editing ? `/product/${editing.id}` : '/product'
      const method = editing ? 'PUT' : 'POST'
      await apiFetch(url, { method, body: payload })

      // refresh product list
      const refreshedData = await apiFetch('/product', { auth: false })
      setProducts(Array.isArray(refreshedData) ? refreshedData : [])
      setShowForm(false)
      toast.success(editing ? 'Termék frissítve.' : 'Termék létrehozva.')
    } catch (err) {
      setFormError(err?.message || 'Nem sikerült menteni.')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (productId) => {
    const sure = window.confirm('Biztos törlöd a terméket?')
    if (!sure) return
    try {
      await apiFetch(`/product/${productId}`, { method: 'DELETE' })
      setProducts((prev) => prev.filter((p) => p.id !== productId))
      toast.success('Termék törölve.')
    } catch (err) {
      toast.error(err?.message || 'Nem sikerült törölni.')
    }
  }

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

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            ➕ Új termék
          </button>
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
              <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600">
                Beszállító
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600">
                Nettó
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600">
                Bruttó
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600">
                ÁFA%
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600">
                Készlet
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600">
                Low
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600">
                Művelet
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-sm text-gray-600" colSpan={9}>
                  Betöltés...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-600" colSpan={9}>
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
                  <td className="px-4 py-3 text-sm text-gray-700">{p.supplierName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right tabular-nums">
                    {money(p.price_net)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right tabular-nums">
                    {money(p.price_gross)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right tabular-nums">
                    {p.vat_rate ?? '-'}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm font-semibold text-right tabular-nums ${
                      p.low > 0 && p.amount <= p.low ? 'text-red-700' : 'text-gray-900'
                    }`}
                  >
                    {p.amount}
                    {p.low > 0 && p.amount <= p.low && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                        alacsony
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right tabular-nums">
                    {p.low}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(p.productId)}
                        className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 transition"
                      >
                        Szerk
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(p.productId)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                      >
                        Töröl
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 p-6">
              <div>
                <h4 className="text-lg font-bold text-gray-900">
                  {editing ? 'Termék szerkesztése' : 'Új termék'}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Név, kód, árak, ÁFA, beszállító, low-stock küszöb.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveProduct} className="p-6 space-y-4">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Név</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kód</label>
                  <input
                    value={form.product_code}
                    onChange={(e) => setForm((f) => ({ ...f, product_code: e.target.value }))}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nettó</label>
                  <input
                    inputMode="numeric"
                    value={form.price_net}
                    onChange={(e) => setForm((f) => ({ ...f, price_net: e.target.value }))}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bruttó</label>
                  <input
                    inputMode="numeric"
                    value={form.price_gross}
                    onChange={(e) => setForm((f) => ({ ...f, price_gross: e.target.value }))}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ÁFA %</label>
                  <input
                    inputMode="numeric"
                    value={form.vat_rate}
                    onChange={(e) => setForm((f) => ({ ...f, vat_rate: e.target.value }))}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Beszállító</label>
                  <select
                    value={form.supplier_id}
                    onChange={(e) => setForm((f) => ({ ...f, supplier_id: e.target.value }))}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— nincs —</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.company_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Low-stock küszöb</label>
                  <input
                    inputMode="numeric"
                    value={form.low_stock_threshold}
                    onChange={(e) => setForm((f) => ({ ...f, low_stock_threshold: e.target.value }))}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Ha a készlet ≤ küszöb, pirossal jelöljük.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Mentés...' : 'Mentés'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products

