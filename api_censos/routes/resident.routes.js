import { Router } from 'express';
import {
  getResidents,
  getResidentById,
  createResident,
  updateResident,
  deleteResident,
  approveByPresident,
  approveByTreasurer,
  approveBySecretary,
  getApprovalStatus
} from '../controllers/resident.controller.js';
import { validate } from '../middlewares/validate.js';
import { createResidentSchema, updateResidentSchema, approveResidentSchema } from '../schemas/resident.schema.js';
import { auth, checkPermission } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/residents:
 *   get:
 *     summary: Obtener todos los residentes activos
 *     tags: [Residentes]
 *     responses:
 *       200:
 *         description: Lista de residentes activos
 */
// GET /api/residents - Leer residentes (requiere resident:read)
router.get('/', auth, checkPermission('resident', 'read'), getResidents);

/**
 * @swagger
 * /api/residents/{id}:
 *   get:
 *     summary: Obtener residente por ID
 *     tags: [Residentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Residente encontrado
 *       404:
 *         description: Residente no encontrado
 */
router.get('/:id', auth, checkPermission('resident', 'read'), getResidentById);

/**
 * @swagger
 * /api/residents:
 *   post:
 *     summary: Crear nuevo residente
 *     tags: [Residentes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - dwellingId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID del usuario (requerido)
 *               dwellingId:
 *                 type: string
 *                 description: ID de la vivienda (requerido)
 *               status:
 *                 type: string
 *                 description: Estado del residente
 *     responses:
 *       201:
 *         description: Residente creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
// POST /api/residents - Crear residente (requiere resident:create)
router.post('/', auth, checkPermission('resident', 'create'), validate(createResidentSchema), createResident);

/**
 * @swagger
 * /api/residents/{id}:
 *   put:
 *     summary: Actualizar residente
 *     tags: [Residentes]
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
 *               userId:
 *                 type: string
 *               dwellingId:
 *                 type: string
 *               status:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Residente actualizado
 *       404:
 *         description: Residente no encontrado
 */
// PUT /api/residents/:id - Actualizar residente (requiere resident:update)
router.put('/:id', auth, checkPermission('resident', 'update'), validate(updateResidentSchema), updateResident);

/**
 * @swagger
 * /api/residents/{id}:
 *   delete:
 *     summary: Eliminar residente (soft delete)
 *     tags: [Residentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Residente eliminado
 */
// DELETE /api/residents/:id - Eliminar residente (requiere resident:delete)
router.delete('/:id', auth, checkPermission('resident', 'delete'), deleteResident);

/**
 * @swagger
 * /api/residents/{id}/approve/president:
 *   post:
 *     summary: Presidente aprueba/rechaza residente
 *     tags: [Residentes]
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
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 description: Estado de la aprobación
 *     responses:
 *       200:
 *         description: Aprobación del presidente registrada
 *       404:
 *         description: Residente no encontrado
 */
router.post('/:id/approve/president', auth, checkPermission('resident', 'update'), validate(approveResidentSchema), approveByPresident);

/**
 * @swagger
 * /api/residents/{id}/approve/treasurer:
 *   post:
 *     summary: Tesorero aprueba/rechaza residente
 *     tags: [Residentes]
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
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 description: Estado de la aprobación
 *     responses:
 *       200:
 *         description: Aprobación del tesorero registrada
 *       404:
 *         description: Residente no encontrado
 */
router.post('/:id/approve/treasurer', auth, checkPermission('resident', 'update'), validate(approveResidentSchema), approveByTreasurer);

/**
 * @swagger
 * /api/residents/{id}/approve/secretary:
 *   post:
 *     summary: Secretario aprueba/rechaza residente
 *     tags: [Residentes]
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
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 description: Estado de la aprobación
 *     responses:
 *       200:
 *         description: Aprobación del secretario registrada
 *       404:
 *         description: Residente no encontrado
 */
router.post('/:id/approve/secretary', auth, checkPermission('resident', 'update'), validate(approveResidentSchema), approveBySecretary);

/**
 * @swagger
 * /api/residents/{id}/approval-status:
 *   get:
 *     summary: Obtener estado de aprobación de residente
 *     tags: [Residentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado de aprobación obtenido
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
 *                     resident:
 *                       type: object
 *                     approvals:
 *                       type: object
 *                       properties:
 *                         president:
 *                           type: string
 *                           enum: [pending, approved, rejected]
 *                         treasurer:
 *                           type: string
 *                           enum: [pending, approved, rejected]
 *                         secretary:
 *                           type: string
 *                           enum: [pending, approved, rejected]
 *                         counts:
 *                           type: object
 *                           properties:
 *                             approved:
 *                               type: integer
 *                             rejected:
 *                               type: integer
 *                             pending:
 *                               type: integer
 *                         isFullyApproved:
 *                           type: boolean
 *                         isRejected:
 *                           type: boolean
 *       404:
 *         description: Residente no encontrado
 */
router.get('/:id/approval-status', auth, checkPermission('resident', 'read'), getApprovalStatus);

export default router;
