import { render, screen } from '@testing-library/react'
import { LoadingState, EmptyState, TableEmptyRow } from './StateBlocks'

test('LoadingState renders default message', () => {
  render(<LoadingState />)
  expect(screen.getByText('Betöltés...')).toBeInTheDocument()
})

test('LoadingState renders custom message', () => {
  render(<LoadingState message="Adatok töltése..." />)
  expect(screen.getByText('Adatok töltése...')).toBeInTheDocument()
})

test('LoadingState applies custom className', () => {
  const { container } = render(<LoadingState className="my-loading" />)
  expect(container.firstChild).toHaveClass('my-loading')
})

test('EmptyState renders provided message', () => {
  render(<EmptyState message="Nincs találat" />)
  expect(screen.getByText('Nincs találat')).toBeInTheDocument()
})

test('EmptyState applies custom className', () => {
  const { container } = render(<EmptyState message="Üres" className="my-empty" />)
  expect(container.firstChild).toHaveClass('my-empty')
})

test('TableEmptyRow renders in table with message and colSpan', () => {
  render(
    <table>
      <tbody>
        <TableEmptyRow colSpan={4} message="Nincs adat" />
      </tbody>
    </table>
  )

  const cell = screen.getByText('Nincs adat')
  expect(cell.tagName).toBe('TD')
  expect(cell).toHaveAttribute('colspan', '4')
})
