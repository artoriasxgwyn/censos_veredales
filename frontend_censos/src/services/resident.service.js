import api from './api'

export const residentService = {
  async getResidents() {
    const response = await api.get('/residents')
    return response.data
  },

  async getResidentById(id) {
    const response = await api.get(`/residents/${id}`)
    return response.data
  },

  async createResident(residentData) {
    const response = await api.post('/residents', residentData)
    return response.data
  },

  async updateResident(id, residentData) {
    const response = await api.put(`/residents/${id}`, residentData)
    return response.data
  },

  async deleteResident(id) {
    const response = await api.delete(`/residents/${id}`)
    return response.data
  },

  async approveByPresident(id, status) {
    const response = await api.post(`/residents/${id}/approve/president`, { status })
    return response.data
  },

  async approveByTreasurer(id, status) {
    const response = await api.post(`/residents/${id}/approve/treasurer`, { status })
    return response.data
  },

  async approveBySecretary(id, status) {
    const response = await api.post(`/residents/${id}/approve/secretary`, { status })
    return response.data
  },

  async getApprovalStatus(id) {
    const response = await api.get(`/residents/${id}/approval-status`)
    return response.data
  }
}
