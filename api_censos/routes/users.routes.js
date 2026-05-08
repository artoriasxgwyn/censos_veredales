import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser, assignRole, removeRole, getAllUsers, createUser, uploadSignature, changePassword, approvePasswordChange, getPendingPasswordChanges } from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.js';
import { updateUserSchema, assignRoleSchema, createUserSchema } from '../schemas/user.schema.js';
import { auth, isPresident, checkPermission } from '../middlewares/auth.js';
import { auditLog } from '../middlewares/audit.js';

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
 *     summary: Obtener todos los usuarios activos de la comunidad (requiere autenticación)
 *     tags: [Users]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Lista de usuarios activos de la comunidad
 */
// GET /api/users/public - Endpoint para usuarios autenticados de la comunidad
router.get('/public', auth, getAllUsers);

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
// PUT /api/users/:id - Actualizar usuario (requiere user:update)
router.put('/:id', auth, checkPermission('user', 'update'), validate(updateUserSchema), auditLog('user', 'update'), updateUser);

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
router.delete('/:id', auth, checkPermission('resident', 'delete'), auditLog('user', 'delete'), deleteUser);

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
router.post('/:id/role', auth, checkPermission('user', 'manageRoles'), validate(assignRoleSchema), auditLog('user', 'assignRole'), assignRole);

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
router.delete('/:id/role', auth, checkPermission('user', 'manageRoles'), auditLog('user', 'removeRole'), removeRole);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear usuario con rol (solo presidente)
 *     tags: [Users]
 *     security:
 *       - xToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - documentNumber
 *               - phone
 *               - email
 *               - password
 *               - role
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
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [president, tesorero, secretario, residente, censista]
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Email duplicado o rol de junta ya ocupado
 *       403:
 *         description: No autorizado
 */
router.post('/', auth, checkPermission('user', 'create'), auditLog('user', 'create'), createUser);

/**
 * @swagger
 * /api/users/{id}/signature:
 *   post:
 *     summary: Subir/actualizar firma digital
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
 *               - signatureData
 *             properties:
 *               signatureData:
 *                 type: string
 *                 description: Firma digital en formato dataURL (PNG base64)
 *     responses:
 *       200:
 *         description: Firma guardada exitosamente
 *       400:
 *         description: No se proporcionó la firma
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/:id/signature', auth, uploadSignature);

/**
 * @swagger
 * /api/users/{id}/password:
 *   put:
 *     summary: Cambiar contraseña (presidente aplica inmediatamente, otros solicitan aprobación)
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
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Contraseña actualizada o solicitud enviada
 *       400:
 *         description: Contraseña muy corta
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id/password', auth, changePassword);

/**
 * @swagger
 * /api/users/pending-passwords:
 *   get:
 *     summary: Obtener usuarios con cambio de contraseña pendiente (solo presidente)
 *     tags: [Users]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Lista de usuarios con cambio pendiente
 *       403:
 *         description: Solo el presidente puede ver esto
 */
router.get('/pending-passwords', auth, isPresident, getPendingPasswordChanges);

/**
 * @swagger
 * /api/users/approve-password-change:
 *   post:
 *     summary: Aprobar o rechazar cambio de contraseña pendiente (solo presidente)
 *     tags: [Users]
 *     security:
 *       - xToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - action
 *             properties:
 *               userId:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *     responses:
 *       200:
 *         description: Cambio aprobado o rechazado
 *       400:
 *         description: Acción inválida o sin cambio pendiente
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: Solo el presidente puede hacer esto
 */
router.post('/approve-password-change', auth, isPresident, auditLog('user', 'approvePasswordChange'), approvePasswordChange);

export default router;
