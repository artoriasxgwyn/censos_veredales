import api from './api'

export const letterService = {
  async requestLetter(letterData) {
    const response = await api.post('/letters', letterData)
    return response.data
  },

  async getMyLetters() {
    const response = await api.get('/letters/my-letters')
    return response.data
  },

  async getCommunityLetters() {
    const response = await api.get('/letters/community')
    return response.data
  },

  async getLetterById(id) {
    const response = await api.get(`/letters/${id}`)
    return response.data
  },

  async approveByPresident(id, status) {
    const response = await api.post(`/letters/${id}/approve/president`, { status })
    return response.data
  },

  async approveByTreasurer(id, status) {
    const response = await api.post(`/letters/${id}/approve/treasurer`, { status })
    return response.data
  },

  async approveBySecretary(id, status) {
    const response = await api.post(`/letters/${id}/approve/secretary`, { status })
    return response.data
  },

  async getApprovalStatus(id) {
    const response = await api.get(`/letters/${id}/approval-status`)
    return response.data
  },

  async generatePdf(id) {
    const response = await api.post(`/letters/${id}/generate-pdf`)
    return response.data
  },

  async downloadPdf(id) {
    // Retornamos la URL completa para descarga directa
    return `${api.defaults.baseURL}/letters/${id}/download`
  },

  async verifyByQr(qrCodigo) {
    const response = await api.get(`/letters/verify/${qrCodigo}`)
    return response.data
  }
}
