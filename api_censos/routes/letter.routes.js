import { Router } from 'express';
import {
  requestLetter,
  getMyLetters,
  getCommunityLetters,
  getLetterById,
  approveByPresident,
  approveByTreasurer,
  approveBySecretary,
  getApprovalStatus,
  generatePdf,
  downloadPdf,
  verifyByQr
} from '../controllers/letter.controller.js';
import { auth, checkPermission } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/letters:
 *   post:
 *     summary: Solicitar nueva carta (normal o juramentada)
 *     tags: [Cartas]
 *     security:
 *       - xToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - residentId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [normal, juramentada]
 *                 description: Tipo de carta (normal requiere aprobación triple, juramentada requiere 1 año de antigüedad)
 *               residentId:
 *                 type: string
 *                 format: uuid
 *                 description: ID del residente
 *     responses:
 *       201:
 *         description: Carta solicitada exitosamente
 *       400:
 *         description: Datos inválidos o residente no cumple requisitos
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Residente no encontrado
 */
router.post('/', auth, checkPermission('letter', 'generateNormal'), requestLetter);

/**
 * @swagger
 * /api/letters/my-letters:
 *   get:
 *     summary: Obtener mis cartas solicitadas
 *     tags: [Cartas]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Lista de cartas del usuario
 */
router.get('/my-letters', auth, getMyLetters);

/**
 * @swagger
 * /api/letters/community:
 *   get:
 *     summary: Obtener todas las cartas de la comunidad (solo presidente)
 *     tags: [Cartas]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Lista de cartas de la comunidad
 *       403:
 *         description: Solo el presidente puede acceder
 */
router.get('/community', auth, getCommunityLetters);

/**
 * @swagger
 * /api/letters/{id}:
 *   get:
 *     summary: Obtener carta por ID
 *     tags: [Cartas]
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
 *         description: Carta encontrada
 *       404:
 *         description: Carta no encontrada
 */
router.get('/:id', auth, getLetterById);

/**
 * @swagger
 * /api/letters/{id}/approve/president:
 *   post:
 *     summary: Presidente aprueba/rechaza carta
 *     tags: [Cartas]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Aprobación registrada
 */
router.post('/:id/approve/president', auth, checkPermission('letter', 'generateNormal'), approveByPresident);

/**
 * @swagger
 * /api/letters/{id}/approve/treasurer:
 *   post:
 *     summary: Tesorero aprueba/rechaza carta
 *     tags: [Cartas]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Aprobación registrada
 */
router.post('/:id/approve/treasurer', auth, checkPermission('letter', 'generateNormal'), approveByTreasurer);

/**
 * @swagger
 * /api/letters/{id}/approve/secretary:
 *   post:
 *     summary: Secretario aprueba/rechaza carta
 *     tags: [Cartas]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Aprobación registrada
 */
router.post('/:id/approve/secretary', auth, checkPermission('letter', 'generateNormal'), approveBySecretary);

/**
 * @swagger
 * /api/letters/{id}/approval-status:
 *   get:
 *     summary: Obtener estado de aprobación de carta
 *     tags: [Cartas]
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
 *         description: Estado de aprobación
 */
router.get('/:id/approval-status', auth, getApprovalStatus);

/**
 * @swagger
 * /api/letters/{id}/generate-pdf:
 *   post:
 *     summary: Generar PDF de carta aprobada
 *     tags: [Cartas]
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
 *         description: PDF generado
 *       400:
 *         description: Carta no aprobada
 */
router.post('/:id/generate-pdf', auth, generatePdf);

/**
 * @swagger
 * /api/letters/{id}/download:
 *   get:
 *     summary: Descargar PDF de carta
 *     tags: [Cartas]
 *     security:
 *       - xToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirección al PDF
 */
router.get('/:id/download', auth, downloadPdf);

/**
 * @swagger
 * /api/letters/verify/{qrCodigo}:
 *   get:
 *     summary: Verificar carta por código QR (público)
 *     tags: [Cartas]
 *     parameters:
 *       - in: path
 *         name: qrCodigo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carta verificada
 *       404:
 *         description: QR inválido
 */
router.get('/verify/:qrCodigo', verifyByQr);

export default router;
