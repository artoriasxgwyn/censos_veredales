import api from './api'

export const dashboardService = {
  async getAdminDashboard() {
    const response = await api.get('/dashboard/admin')
    return response.data
  },

  async getResidentDashboard() {
    const response = await api.get('/dashboard/resident')
    return response.data
  }
}
