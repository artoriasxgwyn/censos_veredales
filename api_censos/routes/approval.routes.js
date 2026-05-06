import { Router } from 'express';
import {
  getPendingCount,
  getPendingRequests,
  approveResident,
  approveDwelling,
  approveLetter
} from '../controllers/approval.controller.js';
import { auth } from '../middlewares/auth.js';
import { auditLog } from '../middlewares/audit.js';

const router = Router();

/**
 * @swagger
 * /api/approvals/pending-count:
 *   get:
 *     summary: Obtener conteo de solicitudes pendientes para dashboard
 *     tags: [Aprobaciones]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Conteo de residentes, viviendas y cartas pendientes
 *       401:
 *         description: No autorizado
 */
router.get('/pending-count', auth, getPendingCount);

/**
 * @swagger
 * /api/approvals/pending:
 *   get:
 *     summary: Obtener lista detallada de solicitudes pendientes
 *     tags: [Aprobaciones]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Lista detallada de solicitudes pendientes
 *       401:
 *         description: No autorizado
 */
router.get('/pending', auth, getPendingRequests);

/**
 * @swagger
 * /api/approvals/resident/{id}:
 *   post:
 *     summary: Aprobar/rechazar residente pendiente
 *     tags: [Aprobaciones]
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
 *         description: Residente aprobado/rechazado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Residente no encontrado
 */
router.post('/resident/:id', auth, auditLog('resident', 'approve'), approveResident);

/**
 * @swagger
 * /api/approvals/dwelling/{id}:
 *   post:
 *     summary: Aprobar/rechazar vivienda pendiente
 *     tags: [Aprobaciones]
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
 *         description: Vivienda aprobada/rechazada
 *       404:
 *         description: Vivienda no encontrada
 */
router.post('/dwelling/:id', auth, auditLog('dwelling', 'approve'), approveDwelling);

/**
 * @swagger
 * /api/approvals/letter/{id}:
 *   post:
 *     summary: Aprobar/rechazar carta juramentada pendiente
 *     tags: [Aprobaciones]
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
 *         description: Carta aprobada/rechazada
 *       404:
 *         description: Carta no encontrada
 */
router.post('/letter/:id', auth, auditLog('letter', 'approve'), approveLetter);

export default router;
