import { defineStore } from 'pinia'
import { notificationService } from '@/services/notification.service'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false
  }),

  getters: {
    hasNotifications: (state) => state.notifications.length > 0,
    hasUnreadNotifications: (state) => state.unreadCount > 0,
    unreadNotifications: (state) => state.notifications.filter(n => !n.read),
    readNotifications: (state) => state.notifications.filter(n => n.read)
  },

  actions: {
    async fetchNotifications() {
      this.loading = true
      try {
        const response = await notificationService.getNotifications()
        this.notifications = response.data || []
        this.updateUnreadCount()
        return response.data
      } catch (error) {
        console.error('Error al cargar notificaciones:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchUnreadCount() {
      try {
        const response = await notificationService.getUnreadCount()
        this.unreadCount = response.data?.unreadCount || 0
        return response.data
      } catch (error) {
        console.error('Error al cargar cantidad no leída:', error)
        return null
      }
    },

    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.read).length
    },

    async markAsRead(notificationId) {
      try {
        const response = await notificationService.markAsRead(notificationId)
        const notification = this.notifications.find(n => n._id === notificationId)
        if (notification) {
          notification.read = true
        }
        this.updateUnreadCount()
        return response.data
      } catch (error) {
        console.error('Error al marcar como leída:', error)
        return null
      }
    },

    async markAllAsRead() {
      try {
        const response = await notificationService.markAllAsRead()
        this.notifications.forEach(n => n.read = true)
        this.unreadCount = 0
        return response.data
      } catch (error) {
        console.error('Error al marcar todas como leídas:', error)
        return null
      }
    },

    // Agregar notificación manualmente (para actualizaciones en tiempo real)
    addNotification(notification) {
      this.notifications.unshift(notification)
      if (!notification.read) {
        this.unreadCount++
      }
    }
  }
})
