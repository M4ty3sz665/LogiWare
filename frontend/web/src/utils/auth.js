
export function validateEmail(email) {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,10}$/
  return emailRegex.test(email)
}

export function validatePhone(phone) {
  if (typeof phone !== 'string') return false

  const trimmed = phone.trim()
  const allowedCharacters = /^\+?[0-9\s()-]+$/

  if (!trimmed || !allowedCharacters.test(trimmed)) {
    return false
  }

  if ((trimmed.match(/\+/g) || []).length > 1) {
    return false
  }

  if (trimmed.includes('+') && !trimmed.startsWith('+')) {
    return false
  }

  const digitsOnly = trimmed.replace(/\D/g, '')
  return digitsOnly.length >= 8 && digitsOnly.length <= 15
}

async function request(path, body) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const res = await fetch(`${API_URL}/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  
  let data
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch (parseErr) {
      
      data = { message: text }
    }
  } else {
    data = {}
  }

  if (!res.ok) {
    const err = new Error(data.message || 'Szerver hiba')
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
