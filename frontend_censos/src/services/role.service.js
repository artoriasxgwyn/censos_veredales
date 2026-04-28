import api from './api'

export const roleService = {
  async getCommunityRoles() {
    const response = await api.get('/roles')
    return response.data
  },

  async getRoleById(id) {
    const response = await api.get(`/roles/${id}`)
    return response.data
  },

  async createRole(roleData) {
    const response = await api.post('/roles', roleData)
    return response.data
  },

  async updateRolePermissions(id, permissions) {
    const response = await api.put(`/roles/${id}/permissions`, { permissions })
    return response.data
  },

  async deactivateRole(id) {
    const response = await api.delete(`/roles/${id}`)
    return response.data
  },

  async getMyPermissions() {
    const response = await api.get('/roles/my-permissions')
    return response.data
  }
}
