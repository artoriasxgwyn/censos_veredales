import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller.js';
import { upload, handleMulterError } from '../middlewares/upload.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Subir imagen a Cloudinary
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *                 enum: [signature, facade]
 *                 description: Tipo de imagen para determinar la carpeta
 *     responses:
 *       200:
 *         description: Imagen subida exitosamente
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
 *                     url:
 *                       type: string
 *                     filename:
 *                       type: string
 *                     mimetype:
 *                       type: string
 *                     size:
 *                       type: number
 *       400:
 *         description: No se recibio ningun archivo o archivo invalido
 *       500:
 *         description: Error al subir la imagen
 */

// POST /api/upload - Subir imagen (sin autenticacion para permitir registro rapido)
router.post('/', (req, res, next) => {
  console.log('>>> UPLOAD ROUTE HIT');
  console.log('Content-Type:', req.get('Content-Type'));
  next();
}, upload.single('file'), handleMulterError, uploadImage);

export default router;
