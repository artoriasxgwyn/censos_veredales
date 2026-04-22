import { defineStore } from 'pinia'
import { userService } from '@/services/user.service'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    currentUser: null,
    loading: false
  }),

  getters: {
    usersByRole: (state) => (role) => {
      return state.users.filter(u => u.role === role)
    },
    activeUsers: (state) => state.users.filter(u => u.isActive),
    userCount: (state) => state.users.length
  },

  actions: {
    async fetchUsers() {
      this.loading = true
      try {
        const response = await userService.getUsers()
        this.users = response.data || []
        return response.data
      } catch (error) {
        console.error('Error al obtener usuarios:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchAllUsersPublic() {
      this.loading = true
      try {
        const response = await userService.getAllUsersPublic()
        this.users = response.data || []
        return response.data
      } catch (error) {
        console.error('Error al obtener usuarios públicos:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchUserById(id) {
      this.loading = true
      try {
        const response = await userService.getUserById(id)
        this.currentUser = response.data
        return response.data
      } catch (error) {
        console.error('Error al obtener usuario:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    async updateUser(id, userData) {
      this.loading = true
      try {
        const response = await userService.updateUser(id, userData)
        const index = this.users.findIndex(u => u._id === id)
        if (index !== -1) {
          this.users[index] = response.data
        }
        if (this.currentUser?._id === id) {
          this.currentUser = response.data
        }
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al actualizar usuario'
        }
      } finally {
        this.loading = false
      }
    },

    async deleteUser(id) {
      this.loading = true
      try {
        await userService.deleteUser(id)
        this.users = this.users.filter(u => u._id !== id)
        if (this.currentUser?._id === id) {
          this.currentUser = null
        }
        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al eliminar usuario'
        }
      } finally {
        this.loading = false
      }
    },

    async assignRole(id, role) {
      this.loading = true
      try {
        const response = await userService.assignRole(id, role)
        const index = this.users.findIndex(u => u._id === id)
        if (index !== -1) {
          this.users[index] = response.data
        }
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al asignar rol'
        }
      } finally {
        this.loading = false
      }
    },

    async removeRole(id, role) {
      this.loading = true
      try {
        const response = await userService.removeRole(id, role)
        const index = this.users.findIndex(u => u._id === id)
        if (index !== -1) {
          this.users[index] = response.data
        }
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al remover rol'
        }
      } finally {
        this.loading = false
      }
    },

    setCurrentUser(user) {
      this.currentUser = user
    }
  }
})
