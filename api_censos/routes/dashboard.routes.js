import { Router } from 'express';
import { getAdminDashboard, getResidentDashboard } from '../controllers/dashboard.controller.js';
import { auth, checkPermission } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Dashboard para administrador (presidente y junta)
 *     tags: [Dashboard]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Estadísticas de la comunidad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     community:
 *                       type: object
 *                     stats:
 *                       type: object
 *                       properties:
 *                         residents:
 *                           type: object
 *                         dwellings:
 *                           type: object
 *                         letters:
 *                           type: object
 *                         totalUsers:
 *                           type: integer
 *                         pending:
 *                           type: object
 *                     recentAnnouncements:
 *                       type: array
 */
router.get('/admin', auth, checkPermission('dashboard', 'access'), getAdminDashboard);

/**
 * @swagger
 * /api/dashboard/resident:
 *   get:
 *     summary: Dashboard para residente
 *     tags: [Dashboard]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Información personal y estado de trámites del residente
 */
router.get('/resident', auth, getResidentDashboard);

export default router;
