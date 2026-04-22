import { Router } from 'express';
import {
  createAnnouncement,
  getCommunityAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement
} from '../controllers/announcement.controller.js';
import { auth, checkPermission } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/announcements:
 *   post:
 *     summary: Crear nuevo anuncio (requiere announcement:create)
 *     tags: [Anuncios]
 *     security:
 *       - xToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - header
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título del anuncio
 *               header:
 *                 type: string
 *                 description: Encabezado del anuncio
 *               body:
 *                 type: string
 *                 description: Cuerpo del anuncio
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: URLs de imágenes
 *     responses:
 *       201:
 *         description: Anuncio creado exitosamente
 *       403:
 *         description: No autorizado
 */
router.post('/', auth, checkPermission('announcement', 'create'), createAnnouncement);

/**
 * @swagger
 * /api/announcements:
 *   get:
 *     summary: Obtener todos los anuncios publicados de la comunidad
 *     tags: [Anuncios]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Lista de anuncios publicados
 */
router.get('/', auth, checkPermission('announcement', 'read'), getCommunityAnnouncements);

/**
 * @swagger
 * /api/announcements/{id}:
 *   get:
 *     summary: Obtener anuncio por ID
 *     tags: [Anuncios]
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
 *         description: Anuncio encontrado
 *       404:
 *         description: Anuncio no encontrado
 */
router.get('/:id', auth, getAnnouncementById);

/**
 * @swagger
 * /api/announcements/{id}:
 *   put:
 *     summary: Actualizar anuncio
 *     tags: [Anuncios]
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
 *               title:
 *                 type: string
 *               header:
 *                 type: string
 *               body:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Anuncio actualizado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Anuncio no encontrado
 */
router.put('/:id', auth, checkPermission('announcement', 'update'), updateAnnouncement);

/**
 * @swagger
 * /api/announcements/{id}:
 *   delete:
 *     summary: Eliminar anuncio (soft delete)
 *     tags: [Anuncios]
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
 *         description: Anuncio eliminado
 *       403:
 *         description: No autorizado
 */
router.delete('/:id', auth, checkPermission('announcement', 'delete'), deleteAnnouncement);

/**
 * @swagger
 * /api/announcements/{id}/publish:
 *   post:
 *     summary: Publicar anuncio (establece publishedAt)
 *     tags: [Anuncios]
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
 *         description: Anuncio publicado
 */
router.post('/:id/publish', auth, checkPermission('announcement', 'update'), publishAnnouncement);

export default router;
