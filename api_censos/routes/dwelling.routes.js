import { Router } from 'express';
import { getDwellings, getDwellingById, createDwelling, updateDwelling, deleteDwelling, approveByPresident, approveByTreasurer, approveBySecretary, getApprovalStatus } from '../controllers/dwelling.controller.js';
import { validate } from '../middlewares/validate.js';
import { createDwellingSchema, updateDwellingSchema, approveDwellingSchema } from '../schemas/dwelling.schema.js';
import { auth, checkPermission } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/dwellings:
 *   get:
 *     summary: Obtener todas las viviendas activas
 *     tags: [Viviendas]
 *     responses:
 *       200:
 *         description: Lista de viviendas activas
 */
// GET /api/dwellings - Leer viviendas (requiere dwelling:read)
router.get('/', auth, checkPermission('dwelling', 'read'), getDwellings);

/**
 * @swagger
 * /api/dwellings/{id}:
 *   get:
 *     summary: Obtener vivienda por ID
 *     tags: [Viviendas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vivienda encontrada
 *       404:
 *         description: Vivienda no encontrada
 */
router.get('/:id', auth, checkPermission('dwelling', 'read'), getDwellingById);

/**
 * @swagger
 * /api/dwellings:
 *   post:
 *     summary: Crear nueva vivienda
 *     tags: [Viviendas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - arrivalInstructions
 *             properties:
 *               houseNomenclature:
 *                 type: string
 *                 description: Nomenclatura de la vivienda
 *               arrivalInstructions:
 *                 type: string
 *                 description: Indicaciones para llegar (requerido)
 *               mapLocation:
 *                 type: string
 *                 description: URL de ubicación en mapa
 *               constructionDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de construcción
 *               homePhoto:
 *                 type: string
 *                 description: URL de la foto del hogar
 *               ownerUserId:
 *                 type: string
 *                 description: ID del usuario propietario
 *               status:
 *                 type: string
 *                 description: Estado de la vivienda
 *     responses:
 *       201:
 *         description: Vivienda creada exitosamente
 *       400:
 *         description: Datos inválidos
 */
// POST /api/dwellings - Crear vivienda (requiere dwelling:create)
router.post('/', auth, checkPermission('dwelling', 'create'), validate(createDwellingSchema), createDwelling);

/**
 * @swagger
 * /api/dwellings/{id}:
 *   put:
 *     summary: Actualizar vivienda
 *     tags: [Viviendas]
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
 *               houseNomenclature:
 *                 type: string
 *               arrivalInstructions:
 *                 type: string
 *               mapLocation:
 *                 type: string
 *               constructionDate:
 *                 type: string
 *                 format: date
 *               homePhoto:
 *                 type: string
 *               ownerUserId:
 *                 type: string
 *               status:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Vivienda actualizada
 *       404:
 *         description: Vivienda no encontrada
 */
// PUT /api/dwellings/:id - Actualizar vivienda (requiere dwelling:update)
router.put('/:id', auth, checkPermission('dwelling', 'update'), validate(updateDwellingSchema), updateDwelling);

/**
 * @swagger
 * /api/dwellings/{id}:
 *   delete:
 *     summary: Eliminar vivienda (soft delete)
 *     tags: [Viviendas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vivienda eliminada
 */
// DELETE /api/dwellings/:id - Eliminar vivienda (requiere dwelling:delete)
router.delete('/:id', auth, checkPermission('dwelling', 'delete'), deleteDwelling);

/**
 * @swagger
 * /api/dwellings/{id}/approve/president:
 *   post:
 *     summary: Presidente aprueba/rechaza vivienda
 *     tags: [Viviendas]
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
 *         description: Vivienda no encontrada
 */
// POST /api/dwellings/:id/approve/president - Presidente aprueba (requiere dwelling:update)
router.post('/:id/approve/president', auth, checkPermission('dwelling', 'update'), validate(approveDwellingSchema), approveByPresident);

/**
 * @swagger
 * /api/dwellings/{id}/approve/treasurer:
 *   post:
 *     summary: Tesorero aprueba/rechaza vivienda
 *     tags: [Viviendas]
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
 *         description: Vivienda no encontrada
 */
router.post('/:id/approve/treasurer', auth, checkPermission('dwelling', 'update'), validate(approveDwellingSchema), approveByTreasurer);

/**
 * @swagger
 * /api/dwellings/{id}/approve/secretary:
 *   post:
 *     summary: Secretario aprueba/rechaza vivienda
 *     tags: [Viviendas]
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
 *         description: Vivienda no encontrada
 */
router.post('/:id/approve/secretary', auth, checkPermission('dwelling', 'update'), validate(approveDwellingSchema), approveBySecretary);

/**
 * @swagger
 * /api/dwellings/{id}/approval-status:
 *   get:
 *     summary: Obtener estado de aprobación de vivienda
 *     tags: [Viviendas]
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
 *                     dwelling:
 *                       type: object
 *                     approvals:
 *                       type: object
 *                       properties:
 *                         president:
 *                           type: boolean
 *                         treasurer:
 *                           type: boolean
 *                         secretary:
 *                           type: boolean
 *                         count:
 *                           type: integer
 *                         isFullyApproved:
 *                           type: boolean
 *       404:
 *         description: Vivienda no encontrada
 */
router.get('/:id/approval-status', auth, checkPermission('dwelling', 'read'), getApprovalStatus);

export default router;
