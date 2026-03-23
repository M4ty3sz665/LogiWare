// shared helpers for authentication forms

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

async function request(path, body) {
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  // some responses (e.g. 204 No Content) or server errors may return an empty body
  let data
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch (parseErr) {
      // fall back to raw text if it's not JSON
      data = { message: text }
    }
  } else {
    data = {}
  }

  if (!res.ok) {
    const err = new Error(data.message || 'Server error')
    err.payload = data
    throw err
  }
  return data
}

export function login({ email, password }) {
  return request('login', { email, password })
}

export function register({ name, email, phone, password }) {
  return request('register', { name, email, phone, password })
}
