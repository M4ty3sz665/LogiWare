import { describe, test, expect, vi, beforeEach } from 'vitest'
import { validateEmail, login, register } from './auth'

describe('validateEmail', () => {
  test('should return true for a valid email address', () => {
    expect(validateEmail('user@example.com')).toBe(true)
  })

  test('should return true for email with subdomain', () => {
    expect(validateEmail('user@mail.example.com')).toBe(true)
  })

  test('should return false for email without @ sign', () => {
    expect(validateEmail('userexample.com')).toBe(false)
  })

  test('should return false for email without domain', () => {
    expect(validateEmail('user@')).toBe(false)
  })

  test('should return false for empty string', () => {
    expect(validateEmail('')).toBe(false)
  })

  test('should return false for email with spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false)
  })

  test('should return false for a plain string', () => {
    expect(validateEmail('notanemail')).toBe(false)
  })
})

describe('login', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  test('should call /api/login with POST method and correct body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ token: 'abc123', message: 'Successful login' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await login({ email: 'a@b.com', password: 'secret' })

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/login')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ email: 'a@b.com', password: 'secret' })
  })

  test('should return response data on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ token: 'mytoken', admin: false }),
    }))

    const result = await login({ email: 'a@b.com', password: 'pass' })
    expect(result).toHaveProperty('token', 'mytoken')
  })

  test('should throw an Error with message on bad credentials', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ message: 'Wrong username or password' }),
    }))

    await expect(login({ email: 'x@x.com', password: 'wrong' })).rejects.toThrow(
      'Wrong username or password',
    )
  })
})

describe('register', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  test('should call /api/register with POST method and correct body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      text: async () => JSON.stringify({ token: 'tok', message: 'Successful registration' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await register({ name: 'Bob', email: 'b@b.com', phone: '123', password: 'pass' })

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/register')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({
      name: 'Bob',
      email: 'b@b.com',
      phone: '123',
      password: 'pass',
    })
  })

  test('should return token on successful registration', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      text: async () => JSON.stringify({ token: 'newtoken' }),
    }))

    const result = await register({ name: 'Alice', email: 'a@a.com', phone: '', password: '123' })
    expect(result).toHaveProperty('token')
  })

  test('should throw an Error when username already exists', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ message: 'A user with this username already exists' }),
    }))

    await expect(
      register({ name: 'dup', email: 'dup@test.com', phone: '', password: 'pass' }),
    ).rejects.toThrow('A user with this username already exists')
  })
})
