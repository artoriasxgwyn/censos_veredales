import { Router } from 'express';
import { getCommunities, getCommunityById, getCommunityByCode, createCommunity, updateCommunity, deleteCommunity } from '../controllers/community.controller.js';
import { validate } from '../middlewares/validate.js';
import { createCommunitySchema, updateCommunitySchema } from '../schemas/community.schema.js';
import { auth, isPresident } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/communities/public:
 *   get:
 *     summary: Obtener todas las comunidades activas (PÚBLICO - sin autenticación)
 *     tags: [Comunidades]
 *     responses:
 *       200:
 *         description: Lista de comunidades activas
 */
// GET /api/communities/public - Endpoint público sin autenticación
router.get('/public', getCommunities);

/**
 * @swagger
 * /api/communities/code/{code}:
 *   get:
 *     summary: Obtener comunidad por código de 6 dígitos (PÚBLICO)
 *     tags: [Comunidades]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *           length: 6
 *     responses:
 *       200:
 *         description: Comunidad encontrada
 *       404:
 *         description: Comunidad no encontrada
 */
// GET /api/communities/code/:code - Endpoint público para buscar por código
router.get('/code/:code', getCommunityByCode);

/**
 * @swagger
 * /api/communities/{id}:
 *   get:
 *     summary: Obtener comunidad por ID
 *     tags: [Comunidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comunidad encontrada
 *       404:
 *         description: Comunidad no encontrada
 */
router.get('/:id', auth, getCommunityById);

/**
 * @swagger
 * /api/communities:
 *   post:
 *     summary: Crear nueva comunidad y usuario presidente
 *     tags: [Comunidades]
 *     description: Crea una comunidad y automáticamente un usuario con rol de presidente asociado a ella. El código de 6 dígitos se genera automáticamente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - neighborhood
 *               - city
 *               - communityHallAddress
 *               - president
 *             properties:
 *               neighborhood:
 *                 type: string
 *                 description: Nombre del barrio
 *               city:
 *                 type: string
 *                 description: Ciudad
 *               communityHallAddress:
 *                 type: string
 *                 description: Dirección del salón comunal
 *               mapLocation:
 *                 type: string
 *                 format: uri
 *                 description: URL de ubicación en mapa
 *               estimatedResidentCount:
 *                 type: number
 *                 format: int32
 *                 minimum: 1
 *                 description: Número estimado de residentes
 *               president:
 *                 type: object
 *                 required:
 *                   - fullName
 *                   - documentNumber
 *                   - phone
 *                   - email
 *                   - password
 *                 properties:
 *                   fullName:
 *                     type: string
 *                     description: Nombre completo del presidente
 *                   documentNumber:
 *                     type: string
 *                     description: Número de cédula
 *                   birthDate:
 *                     type: string
 *                     format: date
 *                     description: Fecha de nacimiento
 *                   phone:
 *                     type: string
 *                     description: Número de teléfono
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Correo electrónico
 *                   signature:
 *                     type: string
 *                     description: Firma digital (URL o base64)
 *                   password:
 *                     type: string
 *                     minLength: 6
 *                     description: Contraseña (mínimo 6 caracteres)
 *     responses:
 *       201:
 *         description: Comunidad y presidente creados exitosamente
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
 *                       properties:
 *                         _id:
 *                           type: string
 *                         code:
 *                           type: string
 *                           description: Código de 6 dígitos generado
 *                         neighborhood:
 *                           type: string
 *                         city:
 *                           type: string
 *                     president:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *       400:
 *         description: Datos inválidos
 */
// POST /api/communities - Crear comunidad (público - registro inicial)
router.post('/', validate(createCommunitySchema), createCommunity);

/**
 * @swagger
 * /api/communities/{id}:
 *   put:
 *     summary: Actualizar comunidad
 *     tags: [Comunidades]
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
 *               neighborhood:
 *                 type: string
 *               city:
 *                 type: string
 *               communityHallAddress:
 *                 type: string
 *               mapLocation:
 *                 type: string
 *               estimatedResidentCount:
 *                 type: number
 *               presidentId:
 *                 type: string
 *               treasurerId:
 *                 type: string
 *               secretaryId:
 *                 type: string
 *               code:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Comunidad actualizada
 *       404:
 *         description: Comunidad no encontrada
 */
// PUT /api/communities/:id - Actualizar comunidad (solo presidente)
router.put('/:id', auth, isPresident, validate(updateCommunitySchema), updateCommunity);

/**
 * @swagger
 * /api/communities/{id}:
 *   delete:
 *     summary: Eliminar comunidad (soft delete)
 *     tags: [Comunidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comunidad eliminada
 */
// DELETE /api/communities/:id - Eliminar comunidad (solo presidente)
router.delete('/:id', auth, isPresident, deleteCommunity);

export default router;
