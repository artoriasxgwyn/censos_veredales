import api from './api'

export const announcementService = {
  async getCommunityAnnouncements() {
    const response = await api.get('/announcements')
    return response.data
  },

  async getAnnouncementById(id) {
    const response = await api.get(`/announcements/${id}`)
    return response.data
  },

  async createAnnouncement(announcementData) {
    const response = await api.post('/announcements', announcementData)
    return response.data
  },

  async updateAnnouncement(id, announcementData) {
    const response = await api.put(`/announcements/${id}`, announcementData)
    return response.data
  },

  async deleteAnnouncement(id) {
    const response = await api.delete(`/announcements/${id}`)
    return response.data
  },

  async publishAnnouncement(id) {
    const response = await api.post(`/announcements/${id}/publish`)
    return response.data
  }
}
