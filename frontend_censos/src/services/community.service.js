import api from './api'

export const communityService = {
  async getPublicCommunities() {
    const response = await api.get('/communities/public')
    return response.data
  },

  async getCommunityByCode(code) {
    const response = await api.get(`/communities/code/${code}`)
    return response.data
  },

  async getCommunityById(id) {
    const response = await api.get(`/communities/${id}`)
    return response.data
  },

  async createCommunity(communityData) {
    const response = await api.post('/communities', communityData)
    return response.data
  },

  async updateCommunity(id, communityData) {
    const response = await api.put(`/communities/${id}`, communityData)
    return response.data
  },

  async deleteCommunity(id) {
    const response = await api.delete(`/communities/${id}`)
    return response.data
  }
}
