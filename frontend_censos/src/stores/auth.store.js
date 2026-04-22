import { defineStore } from 'pinia'
import { authService } from '@/services/auth.service'
import { useQuasar } from 'quasar'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    userRole: (state) => state.user?.role,
    isPresident: (state) => state.user?.role === 'president',
    isTreasurer: (state) => state.user?.role === 'tesorero',
    isSecretary: (state) => state.user?.role === 'secretario',
    isResident: (state) => state.user?.role === 'residente',
    isCensista: (state) => state.user?.role === 'censista',
    communityId: (state) => state.user?.communityId
  },

  actions: {
    setTokens(accessToken, refreshToken) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
    },

    clearTokens() {
      this.accessToken = null
      this.refreshToken = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },

    async login(email, password) {
      this.loading = true
      try {
        const response = await authService.login(email, password)
        const { user, accessToken, refreshToken } = response.data
        this.user = user
        this.setTokens(accessToken, refreshToken)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al iniciar sesión'
        }
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      try {
        const response = await authService.register(userData)
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error en el registro'
        }
      } finally {
        this.loading = false
      }
    },

    async fetchUser() {
      if (!this.accessToken) return
      try {
        const response = await authService.getMe()
        this.user = response.data
        return response.data
      } catch (error) {
        this.logout()
        return null
      }
    },

    async logout() {
      try {
        await authService.logout()
      } catch (error) {
        console.error('Error al cerrar sesión:', error)
      } finally {
        this.user = null
        this.clearTokens()
      }
    },

    async forgotPassword(email) {
      try {
        const response = await authService.forgotPassword(email)
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al solicitar recuperación'
        }
      }
    },

    async resetPassword(token, newPassword) {
      try {
        const response = await authService.resetPassword(token, newPassword)
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al restablecer contraseña'
        }
      }
    }
  }
})
