import { defineStore } from 'pinia'
import { residentService } from '@/services/resident.service'

export const useResidentStore = defineStore('resident', {
  state: () => ({
    residents: [],
    currentResident: null,
    loading: false
  }),

  getters: {
    pendingResidents: (state) => state.residents.filter(r => r.status === 'pending'),
    approvedResidents: (state) => state.residents.filter(r => r.status === 'approved'),
    rejectedResidents: (state) => state.residents.filter(r => r.status === 'rejected'),
    residentCount: (state) => state.residents.length
  },

  actions: {
    async fetchResidents() {
      this.loading = true
      try {
        const response = await residentService.getResidents()
        this.residents = response.data || []
        return response.data
      } catch (error) {
        console.error('Error al obtener residentes:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchResidentById(id) {
      this.loading = true
      try {
        const response = await residentService.getResidentById(id)
        this.currentResident = response.data
        return response.data
      } catch (error) {
        console.error('Error al obtener residente:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    async createResident(residentData) {
      this.loading = true
      try {
        const response = await residentService.createResident(residentData)
        this.residents.push(response.data)
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al crear residente'
        }
      } finally {
        this.loading = false
      }
    },

    async updateResident(id, residentData) {
      this.loading = true
      try {
        const response = await residentService.updateResident(id, residentData)
        const index = this.residents.findIndex(r => r._id === id)
        if (index !== -1) {
          this.residents[index] = response.data
        }
        if (this.currentResident?._id === id) {
          this.currentResident = response.data
        }
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al actualizar residente'
        }
      } finally {
        this.loading = false
      }
    },

    async deleteResident(id) {
      this.loading = true
      try {
        await residentService.deleteResident(id)
        this.residents = this.residents.filter(r => r._id !== id)
        if (this.currentResident?._id === id) {
          this.currentResident = null
        }
        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al eliminar residente'
        }
      } finally {
        this.loading = false
      }
    },

    async approveResident(id, role, status) {
      this.loading = true
      try {
        let response
        if (role === 'president') {
          response = await residentService.approveByPresident(id, status)
        } else if (role === 'treasurer') {
          response = await residentService.approveByTreasurer(id, status)
        } else if (role === 'secretary') {
          response = await residentService.approveBySecretary(id, status)
        }

        const index = this.residents.findIndex(r => r._id === id)
        if (index !== -1) {
          this.residents[index] = response.data
        }

        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al aprobar residente'
        }
      } finally {
        this.loading = false
      }
    },

    async getApprovalStatus(id) {
      try {
        const response = await residentService.getApprovalStatus(id)
        return response.data
      } catch (error) {
        console.error('Error al obtener estado de aprobación:', error)
        return null
      }
    },

    setCurrentResident(resident) {
      this.currentResident = resident
    }
  }
})
