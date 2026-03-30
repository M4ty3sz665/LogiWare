export function SkeletonLine({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200/80 ${className}`}
      aria-hidden="true"
    />
  )
}

export function SkeletonTable({ rows = 6, cols = 5 }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <div className="min-w-full divide-y divide-gray-200">
        <div className="bg-gray-50 grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="px-4 py-3">
              <SkeletonLine className="h-3 w-24" />
            </div>
          ))}
        </div>
        <div className="divide-y divide-gray-100 bg-white">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {Array.from({ length: cols }).map((__, c) => (
                <div key={c} className="px-4 py-3">
                  <SkeletonLine className="h-4 w-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

