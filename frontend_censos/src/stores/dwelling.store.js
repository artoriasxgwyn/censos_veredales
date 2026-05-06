import { defineStore } from 'pinia'
import { dwellingService } from '@/services/dwelling.service'

export const useDwellingStore = defineStore('dwelling', {
  state: () => ({
    dwellings: [],
    currentDwelling: null,
    loading: false
  }),

  getters: {
    pendingDwellings: (state) => state.dwellings.filter(d => d.status === 'pending'),
    approvedDwellings: (state) => state.dwellings.filter(d => d.status === 'approved'),
    rejectedDwellings: (state) => state.dwellings.filter(d => d.status === 'rejected'),
    dwellingCount: (state) => state.dwellings.length
  },

  actions: {
    async fetchDwellings() {
      this.loading = true
      try {
        const response = await dwellingService.getDwellings()
        this.dwellings = response.data || []
        return response.data
      } catch (error) {
        console.error('Error al obtener viviendas:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchDwellingById(id) {
      this.loading = true
      try {
        const response = await dwellingService.getDwellingById(id)
        this.currentDwelling = response.data
        return response.data
      } catch (error) {
        console.error('Error al obtener vivienda:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    async createDwelling(dwellingData) {
      this.loading = true
      try {
        const response = await dwellingService.createDwelling(dwellingData)
        this.dwellings.push(response.data)
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al crear vivienda'
        }
      } finally {
        this.loading = false
      }
    },

    async updateDwelling(id, dwellingData) {
      this.loading = true
      try {
        const response = await dwellingService.updateDwelling(id, dwellingData)
        const index = this.dwellings.findIndex(d => d._id === id)
        if (index !== -1) {
          this.dwellings[index] = response.data
        }
        if (this.currentDwelling?._id === id) {
          this.currentDwelling = response.data
        }
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al actualizar vivienda'
        }
      } finally {
        this.loading = false
      }
    },

    async deleteDwelling(id) {
      this.loading = true
      try {
        await dwellingService.deleteDwelling(id)
        this.dwellings = this.dwellings.filter(d => d._id !== id)
        if (this.currentDwelling?._id === id) {
          this.currentDwelling = null
        }
        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al eliminar vivienda'
        }
      } finally {
        this.loading = false
      }
    },

    async approveDwelling(id, role, status) {
      this.loading = true
      try {
        console.log('=== DWELLING STORE DEBUG ===');
        console.log('id:', id);
        console.log('role:', role);
        console.log('status:', status);

        let response
        if (role === 'president') {
          console.log('Calling approveByPresident...');
          response = await dwellingService.approveByPresident(id, status)
        } else if (role === 'tesorero') {
          console.log('Calling approveByTreasurer...');
          response = await dwellingService.approveByTreasurer(id, status)
        } else if (role === 'secretario') {
          console.log('Calling approveBySecretary...');
          response = await dwellingService.approveBySecretary(id, status)
        }

        console.log('Response received:', response);

        // Actualizar dwelling en la lista
        const index = this.dwellings.findIndex(d => d._id === id)
        if (index !== -1) {
          this.dwellings[index] = response.data
        }

        return { success: true, data: response.data }
      } catch (error) {
        console.error('=== DWELLING STORE ERROR ===');
        console.error('error:', error);
        console.error('error.response:', error.response);
        console.error('error.response?.data:', error.response?.data);
        console.error('error.response?.data?.message:', error.response?.data?.message);

        return {
          success: false,
          message: error.response?.data?.message || error.message || 'Error al aprobar vivienda'
        }
      } finally {
        this.loading = false
      }
    },

    async getApprovalStatus(id) {
      try {
        const response = await dwellingService.getApprovalStatus(id)
        return response.data
      } catch (error) {
        console.error('Error al obtener estado de aprobación:', error)
        return null
      }
    },

    setCurrentDwelling(dwelling) {
      this.currentDwelling = dwelling
    }
  }
})
