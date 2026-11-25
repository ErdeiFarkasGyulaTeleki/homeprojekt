import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
})

let accessToken = null
let refreshPromise = null

export function setAccessToken(token) {
  accessToken = token
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url === '/api/auth/refresh-token'
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      refreshPromise ??= api.post('/api/auth/refresh-token')
      const { data } = await refreshPromise
      refreshPromise = null
      setAccessToken(data.accessToken)
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      refreshPromise = null
      setAccessToken(null)
      window.dispatchEvent(new Event('auth:unauthorized'))
      return Promise.reject(refreshError)
    }
  },
)

export default api
