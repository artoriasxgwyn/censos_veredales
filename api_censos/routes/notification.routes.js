import express from 'express';
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../controllers/notification.controller.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Obtener mis notificaciones
 *     tags: [Notificaciones]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Lista de notificaciones del usuario
 *       401:
 *         description: No autorizado
 */
router.get('/', auth, getMyNotifications);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Obtener cantidad de notificaciones no leídas
 *     tags: [Notificaciones]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Cantidad de no leídas
 *       401:
 *         description: No autorizado
 */
router.get('/unread-count', auth, getUnreadCount);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   post:
 *     summary: Marcar notificación como leída
 *     tags: [Notificaciones]
 *     security:
 *       - xToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 *       404:
 *         description: Notificación no encontrada
 */
router.post('/:id/read', auth, markAsRead);

/**
 * @swagger
 * /api/notifications/read-all:
 *   post:
 *     summary: Marcar todas las notificaciones como leídas
 *     tags: [Notificaciones]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Todas marcadas como leídas
 */
router.post('/read-all', auth, markAllAsRead);

export default router;
