import { Router } from 'express';
import {
  requestProfileChange,
  getMyPendingChanges,
  getCommunityPendingChanges,
  approveProfileChange
} from '../controllers/pendingProfileChange.controller.js';
import { auth } from '../middlewares/auth.js';
import { auditLog } from '../middlewares/audit.js';

const router = Router();

/**
 * @swagger
 * /api/profile-changes/request:
 *   post:
 *     summary: Solicitar cambio de perfil (residente, tesorero o secretario)
 *     tags: [CambiosPerfil]
 *     security:
 *       - xToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               documentNumber:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Solicitud creada, pendiente de aprobación triple
 *       400:
 *         description: Ya existe una solicitud pendiente
 *       401:
 *         description: No autorizado
 */
router.post('/request', auth, requestProfileChange);

/**
 * @swagger
 * /api/profile-changes/my-pending:
 *   get:
 *     summary: Obtener mis solicitudes de cambio de perfil pendientes
 *     tags: [CambiosPerfil]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Lista de mis solicitudes pendientes
 *       401:
 *         description: No autorizado
 */
router.get('/my-pending', auth, getMyPendingChanges);

/**
 * @swagger
 * /api/profile-changes/community:
 *   get:
 *     summary: Obtener todas las solicitudes pendientes de la comunidad (solo admins)
 *     tags: [CambiosPerfil]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes pendientes de la comunidad
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol admin
 */
router.get('/community', auth, getCommunityPendingChanges);

/**
 * @swagger
 * /api/profile-changes/{id}/approve:
 *   post:
 *     summary: Aprobar/rechazar cambio de perfil (junta directiva)
 *     tags: [CambiosPerfil]
 *     security:
 *       - xToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cambio aprobado/rechazado
 *       400:
 *         description: Ya aprobaste/rechazaste esta solicitud
 *       404:
 *         description: Solicitud no encontrada
 */
router.post('/:id/approve', auth, auditLog('profileChange', 'approve'), approveProfileChange);

export default router;
