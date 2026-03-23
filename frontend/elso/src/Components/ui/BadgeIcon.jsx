const TONES = {
  indigo: 'from-indigo-500 to-indigo-700 text-white',
  cyan: 'from-cyan-400 to-blue-600 text-white',
  emerald: 'from-emerald-400 to-emerald-600 text-white',
  amber: 'from-amber-400 to-orange-500 text-white',
  rose: 'from-rose-400 to-pink-600 text-white',
  slate: 'from-slate-500 to-slate-700 text-white',
}

const SIZES = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-7 w-7 text-[11px]',
  lg: 'h-9 w-9 text-xs',
}

function BadgeIcon({ label, tone = 'indigo', size = 'md', className = '' }) {
  const toneClass = TONES[tone] || TONES.indigo
  const sizeClass = SIZES[size] || SIZES.md

  return (
    <span
      aria-hidden="true"
      className={`inline-flex select-none items-center justify-center rounded-lg bg-gradient-to-br font-black tracking-[0.08em] shadow-sm ring-1 ring-white/25 ${toneClass} ${sizeClass} ${className}`}
    >
      {label}
    </span>
  )
}

export default BadgeIcon
