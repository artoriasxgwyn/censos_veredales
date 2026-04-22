import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser, assignRole, removeRole, getAllUsers } from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.js';
import { updateUserSchema, assignRoleSchema } from '../schemas/user.schema.js';
import { auth, isPresident, checkPermission } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios activos
 *     tags: [Users]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Lista de usuarios activos
 *       401:
 *         description: No autorizado
 */
// GET /api/users - Leer residentes (requiere permiso resident:read)
router.get('/', auth, checkPermission('resident', 'read'), getUsers);

/**
 * @swagger
 * /api/users/public:
 *   get:
 *     summary: Obtener todos los usuarios activos (PÚBLICO - sin autenticación)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios activos
 */
// GET /api/users/public - Endpoint público sin autenticación
router.get('/public', getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
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
 *         description: Usuario encontrado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', auth, checkPermission('resident', 'read'), getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Users]
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
 *               signature:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *               communityId:
 *                 type: string
 *                 format: uuid
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
// PUT /api/users/:id - Actualizar usuario (requiere resident:update o user:changePassword)
router.put('/:id', auth, checkPermission('resident', 'update'), validate(updateUserSchema), updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar usuario (soft delete)
 *     tags: [Users]
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
 *         description: Usuario eliminado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol de presidente
 */
// DELETE /api/users/:id - Eliminar usuario (solo presidente con resident:delete)
router.delete('/:id', auth, checkPermission('resident', 'delete'), deleteUser);

/**
 * @swagger
 * /api/users/{id}/role:
 *   post:
 *     summary: Asignar rol a usuario (solo presidente)
 *     tags: [Users]
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [tesorero, secretario, residente, censista]
 *     responses:
 *       200:
 *         description: Rol asignado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol de presidente
 *       404:
 *         description: Usuario no encontrado
 */
// POST /api/users/:id/role - Asignar rol (requiere user:manageRoles)
router.post('/:id/role', auth, checkPermission('user', 'manageRoles'), validate(assignRoleSchema), assignRole);

/**
 * @swagger
 * /api/users/{id}/role:
 *   delete:
 *     summary: Remover rol de usuario (solo presidente)
 *     tags: [Users]
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
 *         description: Rol removido exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol de presidente
 *       404:
 *         description: Usuario no encontrado
 */
// DELETE /api/users/:id/role - Remover rol (requiere user:manageRoles)
router.delete('/:id/role', auth, checkPermission('user', 'manageRoles'), removeRole);

export default router;
