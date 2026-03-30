const TONES = {
  indigo: 'from-indigo-500 via-indigo-600 to-indigo-800 text-white',
  cyan: 'from-cyan-400 via-blue-500 to-blue-700 text-white',
  emerald: 'from-emerald-400 via-emerald-500 to-emerald-700 text-white',
  amber: 'from-amber-400 via-orange-500 to-orange-700 text-white',
  rose: 'from-rose-400 via-pink-500 to-fuchsia-700 text-white',
  slate: 'from-slate-400 via-slate-600 to-slate-800 text-white',
}

const SIZES = {
  sm: 'h-6 w-6 text-[10px] rounded-lg',
  md: 'h-7 w-7 text-[11px] rounded-[10px]',
  lg: 'h-9 w-9 text-xs rounded-xl',
}

function Glyph({ icon }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  if (icon === 'dashboard') {
    return (
      <svg viewBox="0 0 24 24" className="h-[68%] w-[68%]" aria-hidden="true">
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" {...common} />
        <rect x="13.5" y="3.5" width="7" height="4" rx="1.4" {...common} />
        <rect x="13.5" y="10.5" width="7" height="10" rx="1.8" {...common} />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" {...common} />
      </svg>
    )
  }

  if (icon === 'create') {
    return (
      <svg viewBox="0 0 24 24" className="h-[68%] w-[68%]" aria-hidden="true">
        <path d="M12 5v14M5 12h14" {...common} />
      </svg>
    )
  }

  if (icon === 'orders') {
    return (
      <svg viewBox="0 0 24 24" className="h-[68%] w-[68%]" aria-hidden="true">
        <path d="M7 4.5h8.5l3 3v12a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z" {...common} />
        <path d="M15.5 4.5v3h3" {...common} />
        <path d="M8.5 12h7M8.5 15.5h7" {...common} />
      </svg>
    )
  }

  if (icon === 'stock') {
    return (
      <svg viewBox="0 0 24 24" className="h-[68%] w-[68%]" aria-hidden="true">
        <path d="M4.5 8.5 12 4l7.5 4.5-7.5 4.5-7.5-4.5z" {...common} />
        <path d="M4.5 12.5 12 17l7.5-4.5" {...common} />
        <path d="M4.5 16.5 12 21l7.5-4.5" {...common} />
      </svg>
    )
  }

  if (icon === 'cart') {
    return (
      <svg viewBox="0 0 24 24" className="h-[68%] w-[68%]" aria-hidden="true">
        <path d="M4.5 5.5h2l1.3 8.2a1.5 1.5 0 0 0 1.5 1.3h7.9a1.5 1.5 0 0 0 1.5-1.2l1.1-5.8H7.2" {...common} />
        <circle cx="10" cy="19" r="1.2" fill="currentColor" />
        <circle cx="16.8" cy="19" r="1.2" fill="currentColor" />
      </svg>
    )
  }

  if (icon === 'profile') {
    return (
      <svg viewBox="0 0 24 24" className="h-[68%] w-[68%]" aria-hidden="true">
        <circle cx="12" cy="8" r="3.2" {...common} />
        <path d="M5 19.5a7 7 0 0 1 14 0" {...common} />
      </svg>
    )
  }

  if (icon === 'logout') {
    return (
      <svg viewBox="0 0 24 24" className="h-[68%] w-[68%]" aria-hidden="true">
        <path d="M9.5 4.5h-3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3" {...common} />
        <path d="M13 8.5 18 12l-5 3.5" {...common} />
        <path d="M17.5 12H9" {...common} />
      </svg>
    )
  }

  if (icon === 'brand') {
    return (
      <svg viewBox="0 0 24 24" className="h-[68%] w-[68%]" aria-hidden="true">
        <path d="M12 3.8 20 8.4v7.2L12 20.2 4 15.6V8.4L12 3.8z" {...common} />
        <path d="M8.3 12.2 10.8 14.7 15.7 9.8" {...common} />
      </svg>
    )
  }

  return null
}

function BadgeIcon({ label, icon, tone = 'indigo', size = 'md', className = '' }) {
  const toneClass = TONES[tone] || TONES.indigo
  const sizeClass = SIZES[size] || SIZES.md
  const hasGlyph = Boolean(icon)

  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex select-none items-center justify-center overflow-hidden bg-gradient-to-br ring-1 ring-white/30 shadow-[0_6px_14px_rgba(15,23,42,0.28)] ${toneClass} ${sizeClass} ${className}`}
    >
      <span className="pointer-events-none absolute inset-[1px] rounded-[inherit] bg-gradient-to-b from-white/18 via-white/5 to-transparent" />
      <span className="pointer-events-none absolute -right-2 -top-2 h-4 w-4 rotate-45 bg-white/20" />
      <span className="pointer-events-none absolute bottom-1 left-1 h-1 w-1 rounded-full bg-white/60" />
      <span className="relative z-10 inline-flex items-center justify-center font-black tracking-[0.08em] drop-shadow-[0_1px_1px_rgba(2,6,23,0.55)]">
        {hasGlyph ? <Glyph icon={icon} /> : label}
      </span>
    </span>
  )
}

export default BadgeIcon
