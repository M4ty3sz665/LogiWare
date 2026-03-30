import { describe, test, expect, vi, beforeEach } from 'vitest'
import { ApiError, isAbortError, apiFetch } from './api'

describe('ApiError', () => {
  test('should be an instance of Error', () => {
    const err = new ApiError('something failed', 400, { message: 'bad request' })
    expect(err).toBeInstanceOf(Error)
  })

  test('should have name ApiError', () => {
    const err = new ApiError('msg', 400, {})
    expect(err.name).toBe('ApiError')
  })

  test('should store status and payload on the error', () => {
    const payload = { message: 'not found' }
    const err = new ApiError('not found', 404, payload)
    expect(err.status).toBe(404)
    expect(err.payload).toEqual(payload)
  })

  test('message should be accessible via .message', () => {
    const err = new ApiError('test message', 500, null)
    expect(err.message).toBe('test message')
  })
})

describe('isAbortError', () => {
  test('should return true for an error with name AbortError', () => {
    const err = new Error('aborted')
    err.name = 'AbortError'
    expect(isAbortError(err)).toBe(true)
  })

  test('should return false for a regular Error', () => {
    const err = new Error('normal error')
    expect(isAbortError(err)).toBe(false)
  })

  test('should return false for null', () => {
    expect(isAbortError(null)).toBe(false)
  })

  test('should return false for undefined', () => {
    expect(isAbortError(undefined)).toBe(false)
  })

  test('should return true for a DOMException with name AbortError', () => {
    if (typeof DOMException !== 'undefined') {
      const err = new DOMException('aborted', 'AbortError')
      expect(isAbortError(err)).toBe(true)
    }
  })
})

describe('apiFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  test('should call fetch with the correct /api path', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => JSON.stringify({ data: 'ok' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await apiFetch('/product')
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/product',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  test('should attach Authorization header when token is in localStorage', async () => {
    localStorage.setItem('token', 'test-token-123')
    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => '{}',
    })
    vi.stubGlobal('fetch', mockFetch)

    await apiFetch('/order')
    const [, options] = mockFetch.mock.calls[0]
    expect(options.headers.Authorization).toBe('test-token-123')
  })

  test('should NOT attach Authorization header when auth=false', async () => {
    localStorage.setItem('token', 'test-token-123')
    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => '{}',
    })
    vi.stubGlobal('fetch', mockFetch)

    await apiFetch('/product', { auth: false })
    const [, options] = mockFetch.mock.calls[0]
    expect(options.headers?.Authorization).toBeUndefined()
  })

  test('should throw ApiError when response is not ok', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 400,
      ok: false,
      text: async () => JSON.stringify({ message: 'Bad request' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await expect(apiFetch('/product')).rejects.toThrow(ApiError)
  })

  test('should throw ApiError with correct status on 404', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 404,
      ok: false,
      text: async () => JSON.stringify({ message: 'Not found' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    try {
      await apiFetch('/product/9999')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      expect(err.status).toBe(404)
    }
  })

  test('should send JSON body with POST method', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 201,
      ok: true,
      text: async () => JSON.stringify({ message: 'created' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await apiFetch('/product', { method: 'POST', body: { name: 'Test' } })
    const [, options] = mockFetch.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(options.body).toBe(JSON.stringify({ name: 'Test' }))
  })

  test('should return null for empty response body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => '',
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await apiFetch('/product')
    expect(result).toBeNull()
  })

  test('should remove token and dispatch logout event on 401', async () => {
    localStorage.setItem('token', 'old-token')
    const mockFetch = vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
      text: async () => JSON.stringify({ message: 'Unauthorized' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    await apiFetch('/order').catch(() => {})

    expect(localStorage.getItem('token')).toBeNull()
    const dispatched = dispatchSpy.mock.calls.map((c) => c[0].type)
    expect(dispatched).toContain('auth:logout')
  })
})
