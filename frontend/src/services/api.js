import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalizes backend { ok, message, data } / { ok:false, message, errors } envelope.
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const payload = error.response?.data
    const message = payload?.message || error.message || 'Something went wrong.'

    if (error.response?.status === 401) {
      // Token missing/expired/invalid — drop local session state.
      localStorage.removeItem('auth_token')
    }

    return Promise.reject({ message, status: error.response?.status, errors: payload?.errors || [] })
  }
)

export default api
