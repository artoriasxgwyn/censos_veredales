import api from './api'

export const authService = {
  async login(email, password) {
    console.log('[authService] Intentando login con email:', email)
    try {
      const response = await api.post('/auth/login', { email, password })
      console.log('[authService] Login exitoso:', response.data)
      return response.data
    } catch (error) {
      console.log('[authService] Error en login:', error.response?.status, error.response?.data)
      throw error
    }
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.data
  },

  async logout() {
    const response = await api.post('/auth/logout')
    return response.data
  },

  async getMe() {
    const response = await api.get('/auth/me')
    return response.data
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  async resetPassword(token, newPassword) {
    const response = await api.post('/auth/reset-password', { token, newPassword })
    return response.data
  }
}
