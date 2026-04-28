import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - agregar token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken
    if (token) {
      config.headers['x-token'] = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - manejar refresh token y errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // NO intentar refresh para requests de autenticación (login, registro, etc.)
    const isAuthRequest = originalRequest.url?.includes('/auth/login') ||
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/forgot-password') ||
                          originalRequest.url?.includes('/auth/reset-password')

    // Si el error es 401 y no es un request de autenticación y no hemos intentado refresh
    if (error.response?.status === 401 && !isAuthRequest && !originalRequest._retry) {
      originalRequest._retry = true
      const authStore = useAuthStore()

      try {
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken: authStore.refreshToken
        })

        const { accessToken, refreshToken } = response.data.data
        authStore.setTokens(accessToken, refreshToken)

        originalRequest.headers['x-token'] = accessToken
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh fallido - cerrar sesión
        authStore.logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
