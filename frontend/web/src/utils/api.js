export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export function isAbortError(error) {
  return (
    error?.name === 'AbortError' ||
    (typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'AbortError')
  )
}

function getToken() {
  return localStorage.getItem('token')
}

function emitLogout() {
  window.dispatchEvent(new CustomEvent('auth:logout'))
}

export async function apiFetch(path, { method = 'GET', body, auth = true, signal } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = token
  }

  const res = await fetch(`/api${path}`, {
    method,
    headers: Object.keys(headers).length ? headers : undefined,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    emitLogout()
  }

  const text = await res.text().catch(() => '')
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!res.ok) {
    throw new ApiError(data?.message || `HTTP ${res.status}`, res.status, data)
  }

  return data
}

