import { Router } from 'express';
import {
  requestDwellingChange,
  getMyPendingDwellingChanges,
  getCommunityPendingDwellingChanges,
  approveDwellingChange
} from '../controllers/pendingDwellingChange.controller.js';
import { auth } from '../middlewares/auth.js';
import { auditLog } from '../middlewares/audit.js';

const router = Router();

/**
 * @swagger
 * /api/dwelling-changes/{id}/request:
 *   post:
 *     summary: Solicitar modificación de vivienda (residente propietario)
 *     tags: [CambiosVivienda]
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
 *             properties:
 *               address:
 *                 type: string
 *               propertyNumber:
 *                 type: string
 *               ownerName:
 *                 type: string
 *               documentNumber:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Solicitud creada, pendiente de aprobación triple
 *       400:
 *         description: Ya existe una solicitud pendiente para esta vivienda
 *       403:
 *         description: No eres propietario de esta vivienda
 *       404:
 *         description: Vivienda no encontrada
 */
router.post('/:id/request', auth, requestDwellingChange);

/**
 * @swagger
 * /api/dwelling-changes/my-pending:
 *   get:
 *     summary: Obtener mis solicitudes de modificación de vivienda pendientes
 *     tags: [CambiosVivienda]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Lista de mis solicitudes pendientes
 *       401:
 *         description: No autorizado
 */
router.get('/my-pending', auth, getMyPendingDwellingChanges);

/**
 * @swagger
 * /api/dwelling-changes/community:
 *   get:
 *     summary: Obtener todas las solicitudes de modificación pendientes (admins)
 *     tags: [CambiosVivienda]
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
router.get('/community', auth, getCommunityPendingDwellingChanges);

/**
 * @swagger
 * /api/dwelling-changes/{id}/approve:
 *   post:
 *     summary: Aprobar/rechazar modificación de vivienda (junta directiva)
 *     tags: [CambiosVivienda]
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
 *         description: Modificación aprobada/rechazada
 *       400:
 *         description: Ya aprobaste/rechazaste esta solicitud
 *       404:
 *         description: Solicitud no encontrada
 */
router.post('/:id/approve', auth, auditLog('dwellingChange', 'approve'), approveDwellingChange);

export default router;
