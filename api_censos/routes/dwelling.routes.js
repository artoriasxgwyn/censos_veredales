import { Router } from 'express';
import { getDwellings, getDwellingById, createDwelling, updateDwelling, deleteDwelling, approveByPresident, approveByTreasurer, approveBySecretary, getApprovalStatus } from '../controllers/dwelling.controller.js';
import { validate } from '../middlewares/validate.js';
import { createDwellingSchema, updateDwellingSchema, approveDwellingSchema } from '../schemas/dwelling.schema.js';
import { auth, checkPermission } from '../middlewares/auth.js';
import { auditLog } from '../middlewares/audit.js';

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
// Rutas específicas primero (antes de la ruta genérica /:id)

/**
 * @swagger
 * /api/dwellings/{id}/approval-status:
 *   get:
 *     summary: Obtener estado de aprobación de una vivienda
 *     tags: [Viviendas]
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
 *         description: Estado de aprobación (president, treasurer, secretary)
 *       404:
 *         description: Vivienda no encontrada
 */
router.get('/:id/approval-status', auth, checkPermission('dwelling', 'read'), getApprovalStatus);

/**
 * @swagger
 * /api/dwellings/{id}/approve/president:
 *   post:
 *     summary: Aprobar vivienda como Presidente
 *     tags: [Viviendas]
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
 *         description: Aprobación registrada
 *       400:
 *         description: Ya aprobaste/rechazaste esta vivienda
 *       404:
 *         description: Vivienda no encontrada
 */
router.post('/:id/approve/president', auth, checkPermission('dwelling', 'update'), validate(approveDwellingSchema), auditLog('dwelling', 'approve'), approveByPresident);

/**
 * @swagger
 * /api/dwellings/{id}/approve/treasurer:
 *   post:
 *     summary: Aprobar vivienda como Tesorero
 *     tags: [Viviendas]
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
 *         description: Aprobación registrada
 *       400:
 *         description: Ya aprobaste/rechazaste esta vivienda
 *       404:
 *         description: Vivienda no encontrada
 */
router.post('/:id/approve/treasurer', auth, checkPermission('dwelling', 'update'), validate(approveDwellingSchema), auditLog('dwelling', 'approve'), approveByTreasurer);

/**
 * @swagger
 * /api/dwellings/{id}/approve/secretary:
 *   post:
 *     summary: Aprobar vivienda como Secretario
 *     tags: [Viviendas]
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
 *         description: Aprobación registrada
 *       400:
 *         description: Ya aprobaste/rechazaste esta vivienda
 *       404:
 *         description: Vivienda no encontrada
 */
router.post('/:id/approve/secretary', auth, checkPermission('dwelling', 'update'), validate(approveDwellingSchema), auditLog('dwelling', 'approve'), approveBySecretary);

// Ruta genérica /:id va al final
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
 *               - cedulaPropietario
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
 *               cedulaPropietario:
 *                 type: string
 *                 description: Cédula del propietario (si está registrado, se vincula automáticamente)
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
router.post('/', auth, checkPermission('dwelling', 'create'), validate(createDwellingSchema), auditLog('dwelling', 'create'), createDwelling);

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
router.put('/:id', auth, checkPermission('dwelling', 'update'), validate(updateDwellingSchema), auditLog('dwelling', 'update'), updateDwelling);

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
router.delete('/:id', auth, checkPermission('dwelling', 'delete'), auditLog('dwelling', 'delete'), deleteDwelling);

export default router;
