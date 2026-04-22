import { defineStore } from 'pinia'
import { communityService } from '@/services/community.service'

export const useCommunityStore = defineStore('community', {
  state: () => ({
    communities: [],
    currentCommunity: null,
    loading: false
  }),

  getters: {
    communityByCode: (state) => (code) => {
      return state.communities.find(c => c.code === code)
    }
  },

  actions: {
    async fetchCommunities() {
      this.loading = true
      try {
        const response = await communityService.getPublicCommunities()
        this.communities = response.data || []
        return response.data
      } catch (error) {
        console.error('Error al obtener comunidades:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchPublicCommunities() {
      return await this.fetchCommunities()
    },

    async findCommunityByCode(code) {
      if (!code) return null
      this.loading = true
      try {
        const response = await communityService.getCommunityByCode(code)
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Comunidad no encontrada'
        }
      } finally {
        this.loading = false
      }
    },

    async fetchCommunityById(id) {
      this.loading = true
      try {
        const response = await communityService.getCommunityById(id)
        this.currentCommunity = response.data
        return response.data
      } catch (error) {
        console.error('Error al obtener comunidad:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    async createCommunity(communityData) {
      this.loading = true
      try {
        const response = await communityService.createCommunity(communityData)
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al crear comunidad'
        }
      } finally {
        this.loading = false
      }
    },

    async updateCommunity(id, communityData) {
      this.loading = true
      try {
        const response = await communityService.updateCommunity(id, communityData)
        if (this.currentCommunity?._id === id) {
          this.currentCommunity = response.data
        }
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al actualizar comunidad'
        }
      } finally {
        this.loading = false
      }
    },

    async deleteCommunity(id) {
      this.loading = true
      try {
        await communityService.deleteCommunity(id)
        this.communities = this.communities.filter(c => c._id !== id)
        if (this.currentCommunity?._id === id) {
          this.currentCommunity = null
        }
        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al eliminar comunidad'
        }
      } finally {
        this.loading = false
      }
    },

    setCurrentCommunity(community) {
      this.currentCommunity = community
    }
  }
})
