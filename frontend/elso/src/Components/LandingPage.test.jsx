import { render, screen } from '@testing-library/react'
import LandingPage from './LandingPage'

// LandingPage uses plain <a> links, no router dependency needed

// --- render tests ---

test('renders LogiWare brand name', () => {
  render(<LandingPage />)
  // brand name appears both in header and hero
  expect(screen.getAllByText('LogiWare').length).toBeGreaterThanOrEqual(1)
})

test('renders main hero heading text', () => {
  render(<LandingPage />)
  expect(screen.getByText(/friss áru/i)).toBeInTheDocument()
})

test('renders platform badge', () => {
  render(<LandingPage />)
  expect(screen.getByText(/zöldség és gyümölcs platform/i)).toBeInTheDocument()
})

test('renders three feature highlights', () => {
  render(<LandingPage />)
  expect(screen.getByText(/készlet valós időben/i)).toBeInTheDocument()
  expect(screen.getByText(/rendelések egy nézetben/i)).toBeInTheDocument()
  expect(screen.getByText(/gyors, mobilbarát/i)).toBeInTheDocument()
})

test('renders Belépés link in nav', () => {
  render(<LandingPage />)
  const loginLinks = screen.getAllByRole('link', { name: /belépés/i })
  expect(loginLinks.length).toBeGreaterThan(0)
})

test('renders Regisztráció links', () => {
  render(<LandingPage />)
  const regLinks = screen.getAllByRole('link', { name: /regisztráció/i })
  expect(regLinks.length).toBeGreaterThan(0)
})

test('Belépés nav link points to /login', () => {
  render(<LandingPage />)
  const loginLinks = screen.getAllByRole('link', { name: /belépés/i })
  expect(loginLinks[0]).toHaveAttribute('href', '/login')
})

test('Regisztráció header link points to /register', () => {
  render(<LandingPage />)
  const regLinks = screen.getAllByRole('link', { name: /regisztráció/i })
  expect(regLinks[0]).toHaveAttribute('href', '/register')
})

test('renders Kezdd el most CTA link', () => {
  render(<LandingPage />)
  expect(screen.getByRole('link', { name: /kezdd el most/i })).toBeInTheDocument()
})

test('Kezdd el most CTA points to /register', () => {
  render(<LandingPage />)
  expect(screen.getByRole('link', { name: /kezdd el most/i })).toHaveAttribute('href', '/register')
})

test('renders Már van fiókom link', () => {
  render(<LandingPage />)
  expect(screen.getByRole('link', { name: /már van fiókom/i })).toBeInTheDocument()
})

test('Már van fiókom link points to /login', () => {
  render(<LandingPage />)
  expect(screen.getByRole('link', { name: /már van fiókom/i })).toHaveAttribute('href', '/login')
})

test('renders footer copyright text', () => {
  render(<LandingPage />)
  expect(screen.getByText(/logiware kft.*2025-2026/i)).toBeInTheDocument()
})
