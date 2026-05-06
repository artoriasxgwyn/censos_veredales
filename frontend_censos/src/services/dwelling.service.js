import api from './api'

export const dwellingService = {
  async getDwellings() {
    const response = await api.get('/dwellings')
    return response.data
  },

  async getDwellingById(id) {
    const response = await api.get(`/dwellings/${id}`)
    return response.data
  },

  async createDwelling(dwellingData) {
    const response = await api.post('/dwellings', dwellingData)
    return response.data
  },

  async updateDwelling(id, dwellingData) {
    const response = await api.put(`/dwellings/${id}`, dwellingData)
    return response.data
  },

  async deleteDwelling(id) {
    const response = await api.delete(`/dwellings/${id}`)
    return response.data
  },

  async approveByPresident(id, status) {
    const response = await api.post(`/dwellings/${id}/approve/president`, { status })
    return response.data
  },

  async approveByTreasurer(id, status) {
    console.log('=== DWELLING SERVICE DEBUG ===');
    console.log('id:', id);
    console.log('status:', status);
    console.log('Calling POST /dwellings/:id/approve/treasurer');
    try {
      const response = await api.post(`/dwellings/${id}/approve/treasurer`, { status })
      console.log('Response:', response);
      return response.data
    } catch (error) {
      console.error('Service error:', error);
      console.error('error.response:', error.response);
      console.error('error.response?.data:', error.response?.data);
      throw error;
    }
  },

  async approveBySecretary(id, status) {
    const response = await api.post(`/dwellings/${id}/approve/secretary`, { status })
    return response.data
  },

  async getApprovalStatus(id) {
    const response = await api.get(`/dwellings/${id}/approval-status`)
    return response.data
  }
}
