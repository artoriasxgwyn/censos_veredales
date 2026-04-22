import { defineStore } from 'pinia'
import { dashboardService } from '@/services/dashboard.service'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    adminStats: null,
    residentStats: null,
    loading: false
  }),

  getters: {
    adminDashboard: (state) => state.adminStats,
    residentDashboard: (state) => state.residentStats
  },

  actions: {
    async fetchAdminDashboard() {
      this.loading = true
      try {
        const response = await dashboardService.getAdminDashboard()
        this.adminStats = response.data || null
        return response.data
      } catch (error) {
        console.error('Error al obtener dashboard de admin:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchResidentDashboard() {
      this.loading = true
      try {
        const response = await dashboardService.getResidentDashboard()
        this.residentStats = response.data || null
        return response.data
      } catch (error) {
        console.error('Error al obtener dashboard de residente:', error)
        return null
      } finally {
        this.loading = false
      }
    }
  }
})
