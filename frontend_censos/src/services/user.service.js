import api from './api'

export const userService = {
  async getUsers() {
    const response = await api.get('/users')
    return response.data
  },

  async getAllUsersPublic() {
    const response = await api.get('/users/public')
    return response.data
  },

  async getUserById(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  async assignRole(id, role) {
    const response = await api.post(`/users/${id}/role`, { role })
    return response.data
  },

  async removeRole(id) {
    // El backend quita el rol actual del usuario, no necesita que se especifique cuál
    const response = await api.delete(`/users/${id}/role`)
    return response.data
  }
}
