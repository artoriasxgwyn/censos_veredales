import { defineStore } from 'pinia'
import { letterService } from '@/services/letter.service'

export const useLetterStore = defineStore('letter', {
  state: () => ({
    letters: [],
    currentLetter: null,
    loading: false
  }),

  getters: {
    pendingLetters: (state) => state.letters.filter(l => l.status === 'pending'),
    approvedLetters: (state) => state.letters.filter(l => l.status === 'approved'),
    issuedLetters: (state) => state.letters.filter(l => l.status === 'issued'),
    rejectedLetters: (state) => state.letters.filter(l => l.status === 'rejected'),
    letterCount: (state) => state.letters.length
  },

  actions: {
    async fetchMyLetters() {
      this.loading = true
      try {
        const response = await letterService.getMyLetters()
        this.letters = response.data || []
        return response.data
      } catch (error) {
        console.error('Error al obtener cartas:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchCommunityLetters() {
      this.loading = true
      try {
        const response = await letterService.getCommunityLetters()
        this.letters = response.data || []
        return response.data
      } catch (error) {
        console.error('Error al obtener cartas de la comunidad:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchLetterById(id) {
      this.loading = true
      try {
        const response = await letterService.getLetterById(id)
        this.currentLetter = response.data
        return response.data
      } catch (error) {
        console.error('Error al obtener carta:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    async requestLetter(letterData) {
      this.loading = true
      try {
        const response = await letterService.requestLetter(letterData)
        this.letters.push(response.data)
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al solicitar carta'
        }
      } finally {
        this.loading = false
      }
    },

    async approveLetter(id, role, status) {
      this.loading = true
      try {
        let response
        if (role === 'president') {
          response = await letterService.approveByPresident(id, status)
        } else if (role === 'treasurer') {
          response = await letterService.approveByTreasurer(id, status)
        } else if (role === 'secretary') {
          response = await letterService.approveBySecretary(id, status)
        }

        const index = this.letters.findIndex(l => l._id === id)
        if (index !== -1) {
          this.letters[index] = response.data
        }

        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al aprobar carta'
        }
      } finally {
        this.loading = false
      }
    },

    async generatePdf(id) {
      this.loading = true
      try {
        const response = await letterService.generatePdf(id)
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al generar PDF'
        }
      } finally {
        this.loading = false
      }
    },

    async verifyByQr(qrCodigo) {
      try {
        const response = await letterService.verifyByQr(qrCodigo)
        return response.data
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'QR inválido'
        }
      }
    },

    setCurrentLetter(letter) {
      this.currentLetter = letter
    }
  }
})
