import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import Community from '../models/community.model.js';

/**
 * Crear notificación (uso interno)
 */
export const createNotification = async ({ userId, communityId, type, title, message, entity, entityId, actionUrl }) => {
  try {
    return await Notification.create({
      userId,
      communityId,
      type,
      title,
      message,
      entity,
      entityId,
      actionUrl
    });
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return null;
  }
};

/**
 * Obtener mis notificaciones
 */
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.userId,
      communityId: req.communityId
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Obtener notificaciones no leídas (para badge)
 */
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.userId,
      communityId: req.communityId,
      read: false
    });

    res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Marcar notificación como leída
 */
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
        communityId: req.communityId
      },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        userId: req.userId,
        communityId: req.communityId,
        read: false
      },
      { read: true }
    );

    res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Notificar a todos los admins de la comunidad
 */
export const notifyAllAdmins = async ({ communityId, type, title, message, entity, entityId, actionUrl }) => {
  try {
    const admins = await User.find({
      communityId,
      role: { $in: ['president', 'secretario', 'tesorero'] },
      isActive: true
    });

    const notifications = await Notification.insertMany(
      admins.map(admin => ({
        userId: admin._id,
        communityId,
        type,
        title,
        message,
        entity,
        entityId,
        actionUrl
      }))
    );

    return notifications;
  } catch (error) {
    console.error('Error al notificar a admins:', error);
    return [];
  }
};
