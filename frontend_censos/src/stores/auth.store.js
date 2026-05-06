import { defineStore } from 'pinia'
import { authService } from '@/services/auth.service'
import { roleService } from '@/services/role.service'
import { useQuasar } from 'quasar'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    loading: false,
    permissions: null,
    communityCode: localStorage.getItem('community_code') || null
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    userRole: (state) => state.user?.role,
    isPresident: (state) => state.user?.role === 'president',
    isTreasurer: (state) => state.user?.role === 'tesorero',
    isSecretary: (state) => state.user?.role === 'secretario',
    isResident: (state) => state.user?.role === 'residente',
    isCensista: (state) => state.user?.role === 'censista',
    communityId: (state) => state.user?.communityId,
    hasPermission: (state) => (module, action) => {
      // Presidente tiene todos los permisos por defecto
      if (state.user?.role === 'president') return true
      // Si no hay permisos cargados, denegar
      if (!state.permissions) return false
      // Si tiene all: true, tiene todos los permisos
      if (state.permissions.all === true) return true
      // Verificar permiso específico
      return state.permissions[module]?.[action] === true
    }
  },

  actions: {
    setTokens(accessToken, refreshToken) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
    },

    setCommunityCode(code) {
      this.communityCode = code
      localStorage.setItem('community_code', code)
    },

    clearTokens() {
      this.accessToken = null
      this.refreshToken = null
      this.communityCode = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('community_code')
    },

    async login(email, password) {
      this.loading = true
      try {
        const response = await authService.login(email, password)
        const { user, accessToken, refreshToken } = response.data
        this.user = user
        this.setTokens(accessToken, refreshToken)

        // Decododar token para obtener communityId y cargar código de comunidad
        if (accessToken) {
          try {
            const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]))
            if (tokenPayload?.communityId) {
              // Cargar información completa de la comunidad
              await this.fetchCommunityInfo()
            }
          } catch (e) {
            console.error('Error al decodificar token:', e)
          }
        }

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
        // Cargar información de la comunidad
        await this.fetchCommunityInfo()
        // Cargar permisos después de cargar el usuario
        if (this.user?.role !== 'president') {
          await this.fetchPermissions()
        }
        return response.data
      } catch (error) {
        this.logout()
        return null
      }
    },

    async fetchPermissions() {
      if (!this.accessToken) return
      if (this.user?.role === 'president') {
        // Presidente tiene todos los permisos
        this.permissions = { all: true }
        return
      }
      try {
        const response = await roleService.getMyPermissions()
        const perms = response.data?.permissions
        // Si el backend retorna 'all' o un objeto de permisos
        this.permissions = perms === 'all' ? { all: true } : (perms || null)
        return response.data
      } catch (error) {
        console.error('Error al cargar permisos:', error)
        this.permissions = null
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
    },

    async fetchCommunityInfo() {
      try {
        const response = await api.get('/communities/my-community')
        console.log('[fetchCommunityInfo] Response:', response.data)
        if (response.data?.data?.code) {
          this.setCommunityCode(response.data.data.code)
        } else if (response.data?.data?._id) {
          // Fallback: usar ID si no hay código
          console.log('[fetchCommunityInfo] No hay código, usando ID:', response.data.data._id)
        }
      } catch (error) {
        console.error('Error al cargar información de comunidad:', error)
        // Si falla, intentar obtener el communityId del token
        if (this.accessToken) {
          try {
            const tokenPayload = JSON.parse(atob(this.accessToken.split('.')[1]))
            console.log('[fetchCommunityInfo] communityId del token:', tokenPayload?.communityId)
          } catch (e) {
            console.error('Error al decodificar token para fallback:', e)
          }
        }
      }
    }
  }
})
