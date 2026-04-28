import { defineStore } from 'pinia'
import { roleService } from '@/services/role.service'

export const useRoleStore = defineStore('role', {
  state: () => ({
    roles: [],
    currentRole: null,
    myPermissions: null,
    loading: false
  }),

  getters: {
    baseRoles: (state) => state.roles.filter(r => r.isBaseRole),
    customRoles: (state) => state.roles.filter(r => !r.isBaseRole),
    roleCount: (state) => state.roles.length
  },

  actions: {
    async fetchCommunityRoles() {
      this.loading = true
      try {
        const response = await roleService.getCommunityRoles()
        this.roles = response.data || []
        return response.data
      } catch (error) {
        console.error('Error al obtener roles:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchRoleById(id) {
      this.loading = true
      try {
        const response = await roleService.getRoleById(id)
        this.currentRole = response.data
        return response.data
      } catch (error) {
        console.error('Error al obtener rol:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    async createRole(roleData) {
      this.loading = true
      try {
        const response = await roleService.createRole(roleData)
        this.roles.push(response.data.role)
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al crear rol'
        }
      } finally {
        this.loading = false
      }
    },

    async updateRolePermissions(id, permissions) {
      this.loading = true
      try {
        const response = await roleService.updateRolePermissions(id, permissions)
        const index = this.roles.findIndex(r => r._id === id)
        if (index !== -1) {
          this.roles[index] = response.data.role
        }
        if (this.currentRole?._id === id) {
          this.currentRole = response.data.role
        }
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al actualizar permisos'
        }
      } finally {
        this.loading = false
      }
    },

    async deactivateRole(id) {
      this.loading = true
      try {
        await roleService.deactivateRole(id)
        this.roles = this.roles.filter(r => r._id !== id)
        if (this.currentRole?._id === id) {
          this.currentRole = null
        }
        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al desactivar rol'
        }
      } finally {
        this.loading = false
      }
    },

    async fetchMyPermissions() {
      this.loading = true
      try {
        const response = await roleService.getMyPermissions()
        this.myPermissions = response.data
        return response.data
      } catch (error) {
        console.error('Error al obtener permisos:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    setCurrentRole(role) {
      this.currentRole = role
    }
  }
})
