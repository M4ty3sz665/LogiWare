import { SkeletonLine } from './Skeleton.jsx'

export function LoadingState({ message = 'Betöltés...', className = '' }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 ${className}`}>
      <div className="mx-auto w-full max-w-sm">
        <SkeletonLine className="mx-auto h-3 w-40" />
        <SkeletonLine className="mx-auto mt-3 h-3 w-24" />
      </div>
      <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
    </div>
  )
}

export function EmptyState({ message, className = '' }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600 ${className}`}>
      {message}
    </div>
  )
}

export function TableEmptyRow({ colSpan, message }) {
  return (
    <tr>
      <td className="px-4 py-6 text-sm text-gray-600" colSpan={colSpan}>
        {message}
      </td>
    </tr>
  )
}
