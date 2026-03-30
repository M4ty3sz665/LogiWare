import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Login from './Login'
import { ToastProvider } from './ToastProvider'
import * as auth from '../utils/auth'

function renderLogin(props = {}) {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <Login {...props} />
      </ToastProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

test('renders LogiWare heading', () => {
  renderLogin()
  expect(screen.getByText('LogiWare')).toBeInTheDocument()
})

test('renders Bejelentkezés subtitle', () => {
  renderLogin()
  expect(screen.getByText('Bejelentkezés')).toBeInTheDocument()
})

test('renders email input', () => {
  renderLogin()
  expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
})

test('renders password input', () => {
  renderLogin()
  expect(screen.getByLabelText(/jelszó/i)).toBeInTheDocument()
})

test('renders Belépés submit button', () => {
  renderLogin()
  expect(screen.getByRole('button', { name: /belépés/i })).toBeInTheDocument()
})

test('renders Regisztráció navigation button', () => {
  renderLogin()
  expect(screen.getByRole('button', { name: /regisztráció/i })).toBeInTheDocument()
})

test('shows empty-field error when form submitted with empty fields', async () => {
  renderLogin()
  fireEvent.click(screen.getByRole('button', { name: /belépés/i }))
  expect(await screen.findByText('Kérlek tölts ki minden mezőt.')).toBeInTheDocument()
})

test('shows invalid email error when email format is wrong', async () => {
  const { container } = renderLogin()
  fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'user@localhost' } })
  fireEvent.change(screen.getByLabelText(/jelszó/i), { target: { value: 'secret' } })
  fireEvent.submit(container.querySelector('form'))
  expect(await screen.findByText(/valós e.mail/i)).toBeInTheDocument()
})

test('error disappears when user starts typing after error', async () => {
  renderLogin()
  fireEvent.click(screen.getByRole('button', { name: /belépés/i }))
  await screen.findByText('Kérlek tölts ki minden mezőt.')
  fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'a' } })
  await waitFor(() =>
    expect(screen.queryByText('Kérlek tölts ki minden mezőt.')).not.toBeInTheDocument()
  )
})

test('calls apiLogin with email and password on valid submit', async () => {
  const mockLogin = vi.spyOn(auth, 'login').mockResolvedValue({ token: 'tok123' })
  renderLogin()
  fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'user@test.com' } })
  fireEvent.change(screen.getByLabelText(/jelszó/i), { target: { value: 'pass123' } })
  fireEvent.click(screen.getByRole('button', { name: /belépés/i }))
  await waitFor(() => expect(mockLogin).toHaveBeenCalledWith({ email: 'user@test.com', password: 'pass123' }))
})

test('saves token to localStorage on successful login', async () => {
  vi.spyOn(auth, 'login').mockResolvedValue({ token: 'tok123' })
  renderLogin()
  fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'user@test.com' } })
  fireEvent.change(screen.getByLabelText(/jelszó/i), { target: { value: 'pass123' } })
  fireEvent.click(screen.getByRole('button', { name: /belépés/i }))
  await waitFor(() => expect(localStorage.getItem('token')).toBe('tok123'))
})

test('calls onLogin callback with email on successful login', async () => {
  vi.spyOn(auth, 'login').mockResolvedValue({ token: 'tok123' })
  const onLogin = vi.fn()
  renderLogin({ onLogin })
  fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'user@test.com' } })
  fireEvent.change(screen.getByLabelText(/jelszó/i), { target: { value: 'pass123' } })
  fireEvent.click(screen.getByRole('button', { name: /belépés/i }))
  await waitFor(() => expect(onLogin).toHaveBeenCalledWith({ email: 'user@test.com' }))
})

test('shows API error message on failed login', async () => {
  vi.spyOn(auth, 'login').mockRejectedValue(new Error('Hibás jelszó'))
  renderLogin()
  fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'user@test.com' } })
  fireEvent.change(screen.getByLabelText(/jelszó/i), { target: { value: 'wrongpass' } })
  fireEvent.click(screen.getByRole('button', { name: /belépés/i }))
  expect(await screen.findByText('Hibás jelszó')).toBeInTheDocument()
})

test('button shows Bejelentkezés... while submitting', async () => {
  vi.spyOn(auth, 'login').mockImplementation(() => new Promise(() => {}))
  renderLogin()
  fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'user@test.com' } })
  fireEvent.change(screen.getByLabelText(/jelszó/i), { target: { value: 'pass123' } })
  fireEvent.click(screen.getByRole('button', { name: /belépés/i }))
  expect(await screen.findByRole('button', { name: /bejelentkezés\.\.\./i })).toBeInTheDocument()
})

test('button is disabled while submitting', async () => {
  vi.spyOn(auth, 'login').mockImplementation(() => new Promise(() => {}))
  renderLogin()
  fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'user@test.com' } })
  fireEvent.change(screen.getByLabelText(/jelszó/i), { target: { value: 'pass123' } })
  fireEvent.click(screen.getByRole('button', { name: /belépés/i }))
  const btn = await screen.findByRole('button', { name: /bejelentkezés\.\.\./i })
  expect(btn).toBeDisabled()
})
