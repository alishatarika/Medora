import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({ baseURL: '/' })

// ── Helper: decode JWT payload without a library ─────────────────────────────
function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp ? payload.exp * 1000 : null  // convert to ms
  } catch {
    return null
  }
}

function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// ── Request interceptor: attach token + check expiry before every call ───────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (!token) return config

  const expiry = getTokenExpiry(token)
  if (expiry && Date.now() > expiry) {
    // Token expired — clear session and redirect to login
    clearSession()
    toast.error('Session expired. Please log in again.')
    window.location.href = '/login'
    return Promise.reject(new Error('Token expired'))
  }

  config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor: handle 401 from server ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession()
      toast.error('Session expired. Please log in again.')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
