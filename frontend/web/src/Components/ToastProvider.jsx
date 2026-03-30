import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

function Toast({ t, onClose }) {
  const base =
    t.type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : t.type === 'error'
        ? 'border-red-200 bg-red-50 text-red-800'
        : 'border-slate-200 bg-white text-slate-800'
  return (
    <div className={`w-full rounded-xl border px-4 py-3 shadow-lg ${base}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {t.title && <div className="text-sm font-bold">{t.title}</div>}
          <div className="text-sm">{t.message}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold hover:bg-black/5"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((toast) => {
    const id = crypto.randomUUID()
    const t = {
      id,
      type: toast.type || 'info',
      title: toast.title || '',
      message: toast.message || '',
      timeoutMs: toast.timeoutMs ?? 3500,
    }
    setToasts((prev) => [...prev, t])
    if (t.timeoutMs > 0) {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id))
      }, t.timeoutMs)
    }
  }, [])

  const api = useMemo(
    () => ({
      push,
      success: (message, opts = {}) => push({ type: 'success', message, ...opts }),
      error: (message, opts = {}) => push({ type: 'error', message, ...opts }),
      info: (message, opts = {}) => push({ type: 'info', message, ...opts }),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] w-[min(420px,calc(100vw-2.5rem))] space-y-3">
        {toasts.map((t) => (
          <Toast key={t.id} t={t} onClose={() => setToasts((p) => p.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

