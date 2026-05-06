import { Router } from 'express';
import {
  exportResidents,
  exportDwellings,
  exportLetters,
  exportAll
} from '../controllers/export.controller.js';
import { auth, isPresident } from '../middlewares/auth.js';

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
 *         description: Se requiere rol de presidente
 */
router.get('/residents', auth, isPresident, exportResidents);

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
 *         description: Se requiere rol de presidente
 */
router.get('/dwellings', auth, isPresident, exportDwellings);

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
 *         description: Se requiere rol de presidente
 */
router.get('/letters', auth, isPresident, exportLetters);

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
 *         description: Se requiere rol de presidente
 */
router.get('/all', auth, isPresident, exportAll);

export default router;
