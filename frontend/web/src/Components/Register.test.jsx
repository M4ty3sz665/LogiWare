import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Register from './Register'
import { ToastProvider } from './ToastProvider'
import * as auth from '../utils/auth'

function renderRegister(props = {}) {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <Register {...props} />
      </ToastProvider>
    </MemoryRouter>
  )
}

function fillForm({ container, name = 'Teszt Elek', email = 'test@example.com', phone = '+36301234567', password = 'pass123', confirmPassword = 'pass123' } = {}) {
  fireEvent.change(screen.getByLabelText(/teljes név/i), { target: { value: name } })
  fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: email } })
  fireEvent.change(screen.getByLabelText(/telefonszám/i), { target: { value: phone } })
  fireEvent.change(screen.getByLabelText(/^jelszó$/i), { target: { value: password } })
  fireEvent.change(screen.getByLabelText(/jelszó meger/i), { target: { value: confirmPassword } })
  fireEvent.submit(container.querySelector('form'))
}

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

test('renders LogiWare heading', () => {
  renderRegister()
  expect(screen.getByText('LogiWare')).toBeInTheDocument()
})

test('renders Regisztráció subtitle', () => {
  renderRegister()
  expect(screen.getByText('Regisztráció', { selector: 'p' })).toBeInTheDocument()
})

test('renders all five form inputs', () => {
  renderRegister()
  expect(screen.getByLabelText(/teljes név/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/telefonszám/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/^jelszó$/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/jelszó meger/i)).toBeInTheDocument()
})

test('renders Regisztráció submit button', () => {
  renderRegister()
  expect(screen.getByRole('button', { name: 'Regisztráció' })).toBeInTheDocument()
})

test('renders Bejelentkezés navigation button', () => {
  renderRegister()
  expect(screen.getByRole('button', { name: /bejelentkezés/i })).toBeInTheDocument()
})

test('shows empty-field error when form submitted empty', async () => {
  const { container } = renderRegister()
  fireEvent.submit(container.querySelector('form'))
  expect(await screen.findByText('Kérlek tölts ki minden mezőt.')).toBeInTheDocument()
})

test('shows invalid email error for no-dot domain email', async () => {
  const { container } = renderRegister()
  fillForm({ container, email: 'user@localhost' })
  expect(await screen.findByText(/valós e.mail/i)).toBeInTheDocument()
})

test('shows password mismatch error', async () => {
  const { container } = renderRegister()
  fillForm({ container, password: 'pass123', confirmPassword: 'different' })
  expect(await screen.findByText(/jelszavak nem egyeznek/i)).toBeInTheDocument()
})

test('shows short password error when password under 6 chars', async () => {
  const { container } = renderRegister()
  fillForm({ container, password: 'abc', confirmPassword: 'abc' })
  expect(await screen.findByText(/legalább 6 karakter/i)).toBeInTheDocument()
})

test('error disappears when user starts typing after error', async () => {
  const { container } = renderRegister()
  fireEvent.submit(container.querySelector('form'))
  await screen.findByText('Kérlek tölts ki minden mezőt.')
  fireEvent.change(screen.getByLabelText(/teljes név/i), { target: { value: 'x' } })
  await waitFor(() =>
    expect(screen.queryByText('Kérlek tölts ki minden mezőt.')).not.toBeInTheDocument()
  )
})

test('calls apiRegister with all fields on valid submit', async () => {
  const mockRegister = vi.spyOn(auth, 'register').mockResolvedValue({ token: 'tok123' })
  const { container } = renderRegister()
  fillForm({ container })
  await waitFor(() =>
    expect(mockRegister).toHaveBeenCalledWith({
      name: 'Teszt Elek',
      email: 'test@example.com',
      phone: '+36301234567',
      password: 'pass123',
    })
  )
})

test('calls onRegister callback with name and email on success', async () => {
  vi.spyOn(auth, 'register').mockResolvedValue({ token: 'tok123' })
  const onRegister = vi.fn()
  const { container } = renderRegister({ onRegister })
  fillForm({ container })
  await waitFor(() =>
    expect(onRegister).toHaveBeenCalledWith({ name: 'Teszt Elek', email: 'test@example.com' })
  )
})

test('shows API error message on failed registration', async () => {
  vi.spyOn(auth, 'register').mockRejectedValue(new Error('Ez az email már foglalt'))
  const { container } = renderRegister()
  fillForm({ container })
  expect(await screen.findByText('Ez az email már foglalt')).toBeInTheDocument()
})

test('button shows Regisztráció... while submitting', async () => {
  vi.spyOn(auth, 'register').mockImplementation(() => new Promise(() => {}))
  const { container } = renderRegister()
  fillForm({ container })
  expect(await screen.findByRole('button', { name: /regisztráció\.\.\./i })).toBeInTheDocument()
})

test('button is disabled while submitting', async () => {
  vi.spyOn(auth, 'register').mockImplementation(() => new Promise(() => {}))
  const { container } = renderRegister()
  fillForm({ container })
  const btn = await screen.findByRole('button', { name: /regisztráció\.\.\./i })
  expect(btn).toBeDisabled()
})
