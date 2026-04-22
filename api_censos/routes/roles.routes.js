import { Router } from 'express';
import {
  getCommunityRoles,
  getRoleById,
  createRole,
  updateRolePermissions,
  deactivateRole,
  getMyPermissions
} from '../controllers/role.controller.js';
import { auth, isPresident } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Obtener todos los roles de la comunidad
 *     tags: [Roles]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Lista de roles de la comunidad
 *       401:
 *         description: No autorizado
 */
router.get('/', auth, getCommunityRoles);

/**
 * @swagger
 * /api/roles/my-permissions:
 *   get:
 *     summary: Obtener permisos del usuario actual
 *     tags: [Roles]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Permisos del usuario actual
 */
router.get('/my-permissions', auth, getMyPermissions);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Crear nuevo rol personalizado (solo presidente)
 *     tags: [Roles]
 *     security:
 *       - xToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customName
 *             properties:
 *               customName:
 *                 type: string
 *                 example: "censista"
 *               permissions:
 *                 type: object
 *                 description: Estructura de permisos del rol
 *                 example:
 *                   resident:
 *                     create: true
 *                     read: true
 *                     update: false
 *                     delete: false
 *                   dwelling:
 *                     create: false
 *                     read: true
 *                     update: false
 *                     delete: false
 *                   letter:
 *                     generateNormal: true
 *                     generateSworn: false
 *                     qrScan: true
 *                   dashboard:
 *                     access: true
 *                     scope: "limited"
 *                   user:
 *                     changePassword: false
 *                     manageRoles: false
 *                   announcement:
 *                     create: false
 *                     read: true
 *                     update: false
 *                     delete: false
 *     responses:
 *       201:
 *         description: Rol creado exitosamente
 *       403:
 *         description: Solo el presidente puede crear roles
 *       409:
 *         description: Ya existe un rol con este nombre
 */
router.post('/', auth, isPresident, createRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Obtener rol por ID
 *     tags: [Roles]
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
 *         description: Rol encontrado
 *       404:
 *         description: Rol no encontrado
 */
router.get('/:id', auth, getRoleById);

/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   put:
 *     summary: Actualizar permisos de un rol (solo presidente)
 *     tags: [Roles]
 *     security:
 *       - xToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del rol a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: object
 *                 description: Permisos a actualizar (solo los enviados se modifican)
 *                 example:
 *                   resident:
 *                     create: true
 *                     read: true
 *                     update: true
 *                     delete: false
 *                   dwelling:
 *                     create: true
 *                     read: true
 *                     update: true
 *                     delete: false
 *                   letter:
 *                     generateNormal: true
 *                     generateSworn: true
 *                     qrScan: true
 *                   dashboard:
 *                     access: true
 *                     scope: "full"
 *                   user:
 *                     changePassword: false
 *                     manageRoles: false
 *                   announcement:
 *                     create: true
 *                     read: true
 *                     update: true
 *                     delete: false
 *     responses:
 *       200:
 *         description: Permisos actualizados exitosamente
 *       403:
 *         description: Solo el presidente puede modificar permisos
 *       404:
 *         description: Rol no encontrado
 */
router.put('/:id/permissions', auth, isPresident, updateRolePermissions);

/**
 * @swagger
 * /api/roles/{id}/deactivate:
 *   post:
 *     summary: Desactivar rol personalizado (solo presidente)
 *     tags: [Roles]
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
 *         description: Rol desactivado
 *       403:
 *         description: Solo el presidente puede desactivar roles / Los roles base no se pueden desactivar
 *       404:
 *         description: Rol no encontrado
 */
router.post('/:id/deactivate', auth, isPresident, deactivateRole);

export default router;
