import { Router } from 'express';
import {
  exportResidents,
  exportDwellings,
  exportLetters,
  exportAll
} from '../controllers/export.controller.js';
import { auth, checkPermission } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/export/residents:
 *   get:
 *     summary: Exportar residentes a CSV
 *     tags: [Exportar]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Archivo CSV descargable
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Se requiere permiso export:residents
 */
router.get('/residents', auth, checkPermission('export', 'residents'), exportResidents);

/**
 * @swagger
 * /api/export/dwellings:
 *   get:
 *     summary: Exportar viviendas a CSV
 *     tags: [Exportar]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Archivo CSV descargable
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Se requiere permiso export:dwellings
 */
router.get('/dwellings', auth, checkPermission('export', 'dwellings'), exportDwellings);

/**
 * @swagger
 * /api/export/letters:
 *   get:
 *     summary: Exportar cartas a CSV
 *     tags: [Exportar]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: Archivo CSV descargable
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Se requiere permiso export:letters
 */
router.get('/letters', auth, checkPermission('export', 'letters'), exportLetters);

/**
 * @swagger
 * /api/export/all:
 *   get:
 *     summary: Exportar todos los datos (JSON con metadata)
 *     tags: [Exportar]
 *     security:
 *       - xToken: []
 *     responses:
 *       200:
 *         description: JSON con todos los datos de la comunidad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: Se requiere permiso export:all
 */
router.get('/all', auth, checkPermission('export', 'all'), exportAll);

export default router;
