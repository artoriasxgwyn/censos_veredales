import { defineStore } from 'pinia'
import { announcementService } from '@/services/announcement.service'

export const useAnnouncementStore = defineStore('announcement', {
  state: () => ({
    announcements: [],
    currentAnnouncement: null,
    loading: false
  }),

  getters: {
    publishedAnnouncements: (state) => {
      const now = new Date()
      return state.announcements.filter(a => a.publishedAt && new Date(a.publishedAt) <= now)
    },
    draftAnnouncements: (state) => {
      return state.announcements.filter(a => !a.publishedAt)
    },
    announcementCount: (state) => state.announcements.length
  },

  actions: {
    async fetchAnnouncements() {
      this.loading = true
      try {
        const response = await announcementService.getCommunityAnnouncements()
        this.announcements = response.data || []
        return response.data
      } catch (error) {
        console.error('Error al obtener anuncios:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchCommunityAnnouncements() {
      this.loading = true
      try {
        const response = await announcementService.getCommunityAnnouncements()
        this.announcements = response.data || []
        return response.data
      } catch (error) {
        console.error('Error al obtener anuncios:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchAnnouncementById(id) {
      this.loading = true
      try {
        const response = await announcementService.getAnnouncementById(id)
        this.currentAnnouncement = response.data
        return response.data
      } catch (error) {
        console.error('Error al obtener anuncio:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    async createAnnouncement(announcementData) {
      this.loading = true
      try {
        const response = await announcementService.createAnnouncement(announcementData)
        this.announcements.push(response.data)
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al crear anuncio'
        }
      } finally {
        this.loading = false
      }
    },

    async updateAnnouncement(id, announcementData) {
      this.loading = true
      try {
        const response = await announcementService.updateAnnouncement(id, announcementData)
        const index = this.announcements.findIndex(a => a._id === id)
        if (index !== -1) {
          this.announcements[index] = response.data
        }
        if (this.currentAnnouncement?._id === id) {
          this.currentAnnouncement = response.data
        }
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al actualizar anuncio'
        }
      } finally {
        this.loading = false
      }
    },

    async deleteAnnouncement(id) {
      this.loading = true
      try {
        await announcementService.deleteAnnouncement(id)
        this.announcements = this.announcements.filter(a => a._id !== id)
        if (this.currentAnnouncement?._id === id) {
          this.currentAnnouncement = null
        }
        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al eliminar anuncio'
        }
      } finally {
        this.loading = false
      }
    },

    async publishAnnouncement(id) {
      this.loading = true
      try {
        const response = await announcementService.publishAnnouncement(id)
        const index = this.announcements.findIndex(a => a._id === id)
        if (index !== -1) {
          this.announcements[index] = response.data
        }
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al publicar anuncio'
        }
      } finally {
        this.loading = false
      }
    },

    async togglePublish(id) {
      const announcement = this.announcements.find(a => a._id === id)
      if (!announcement) {
        return { success: false, message: 'Anuncio no encontrado' }
      }

      const isPublished = announcement.publishedAt && new Date(announcement.publishedAt) <= new Date()

      if (isPublished) {
        // Mover a borrador - establecer publishedAt en null
        return await this.updateAnnouncement(id, { publishedAt: null })
      } else {
        // Publicar
        return await this.publishAnnouncement(id)
      }
    },

    setCurrentAnnouncement(announcement) {
      this.currentAnnouncement = announcement
    }
  }
})
