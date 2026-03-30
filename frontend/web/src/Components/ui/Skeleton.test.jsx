import { render } from '@testing-library/react'
import { SkeletonLine, SkeletonTable } from './Skeleton'

test('SkeletonLine renders as aria-hidden placeholder', () => {
  const { container } = render(<SkeletonLine />)
  const line = container.querySelector('div[aria-hidden="true"]')
  expect(line).toBeInTheDocument()
  expect(line).toHaveClass('animate-pulse')
})

test('SkeletonLine applies custom className', () => {
  const { container } = render(<SkeletonLine className="h-8 w-32" />)
  const line = container.querySelector('div[aria-hidden="true"]')
  expect(line).toHaveClass('h-8')
  expect(line).toHaveClass('w-32')
})

test('SkeletonTable renders default rows and cols', () => {
  const { container } = render(<SkeletonTable />)
  const lines = container.querySelectorAll('div[aria-hidden="true"]')
  expect(lines.length).toBe(35)
})

test('SkeletonTable renders custom rows and cols', () => {
  const { container } = render(<SkeletonTable rows={2} cols={3} />)
  const lines = container.querySelectorAll('div[aria-hidden="true"]')
  expect(lines.length).toBe(9)
})

test('SkeletonTable root has overflow container styling', () => {
  const { container } = render(<SkeletonTable rows={1} cols={1} />)
  expect(container.firstChild).toHaveClass('overflow-x-auto')
})
