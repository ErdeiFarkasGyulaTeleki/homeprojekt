import api from './api'

export async function registerUser(name, email, password) {
  const response = await api.post('/api/auth/reg', { name, email, password })
  return response.data
}

export async function loginUser(email, password) {
  const response = await api.post('/api/auth/login', { email, password })
  return response.data
}

export async function refreshSession() {
  const response = await api.post('/api/auth/refresh-token')
  return response.data
}

export async function logoutUser() {
  await api.post('/api/auth/logout')
}

export async function fetchProfile() {
  const response = await api.get('/api/users/profil')
  return response.data
}
