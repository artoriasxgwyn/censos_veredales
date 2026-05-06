import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import dwellingsRoutes from './routes/dwelling.routes.js';
import communitiesRoutes from './routes/community.routes.js';
import residentsRoutes from './routes/resident.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import lettersRoutes from './routes/letter.routes.js';
import announcementsRoutes from './routes/announcement.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import approvalRoutes from './routes/approval.routes.js';
import exportRoutes from './routes/export.routes.js';
import pendingProfileChangeRoutes from './routes/pendingProfileChange.routes.js';
import pendingDwellingChangeRoutes from './routes/pendingDwellingChange.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Censos Veredales',
      version: '1.0.0',
      description: 'Sistema de Gestión de Censos Veredales - Documentación completa de la API REST'
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: 'Servidor de desarrollo' }
    ],
    tags: [
      { name: 'Auth', description: 'Autenticación y gestión de sesiones' },
      { name: 'Users', description: 'Gestión de usuarios' },
      { name: 'Roles', description: 'Gestión de roles y permisos' },
      { name: 'Viviendas', description: 'Gestión de viviendas' },
      { name: 'Comunidades', description: 'Gestión de comunidades' },
      { name: 'Residentes', description: 'Gestión de residentes' },
      { name: 'Cartas', description: 'Gestión de cartas (normal y juramentada)' },
      { name: 'Anuncios', description: 'Gestión de anuncios/comunicados' },
      { name: 'Dashboard', description: 'Dashboards de administrador y residente' },
      { name: 'Upload', description: 'Subida de imágenes a Cloudinary' },
      { name: 'Aprobaciones', description: 'Aprobaciones de residentes, viviendas y cartas' },
      { name: 'Exportar', description: 'Exportación de datos a CSV/Excel' },
      { name: 'CambiosPerfil', description: 'Solicitudes de cambio de perfil (pendientes de aprobación)' },
      { name: 'CambiosVivienda', description: 'Solicitudes de modificación de vivienda (triple aprobación)' },
      { name: 'Notificaciones', description: 'Notificaciones del sistema' }
    ],
    components: {
      securitySchemes: {
        xToken: {
          type: 'apiKey',
          in: 'header',
          name: 'x-token',
          description: 'Token JWT para autenticación. Incluir como: x-token: <tu_token>'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' }
          }
        },
        Auth: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { type: 'object' }
          }
        },
        RegisterUser: {
          type: 'object',
          required: ['fullName', 'documentNumber', 'phone', 'email', 'password', 'communityId'],
          properties: {
            fullName: { type: 'string', example: 'Juan Pérez' },
            documentNumber: { type: 'string', example: '1234567890' },
            birthDate: { type: 'string', format: 'date', example: '1990-01-15' },
            phone: { type: 'string', example: '3001234567' },
            email: { type: 'string', format: 'email', example: 'juan@example.com' },
            signature: { type: 'string', example: 'data:image/png;base64,...' },
            password: { type: 'string', minLength: 6, example: 'password123' },
            communityId: { type: 'string', format: 'uuid', example: '507f1f77bcf86cd799439011' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:5176'
  ],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Rate limiter general para todas las rutas API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // 200 peticiones por IP
  message: { success: false, message: 'Demasiadas solicitudes, intente más tarde' },
  // Excluir rutas de autenticación del limiter general
  skip: (req) => req.path.startsWith('/auth/')
});
app.use('/api', generalLimiter);

// Rate limiter específico para login (prevenir brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 intentos de login por IP
  message: { success: false, message: 'Demasiados intentos de inicio de sesión, intente más tarde' },
  // Solo aplicar a POST /auth/login
  keyGenerator: (req) => req.ip
});

// Rate limiter para logout y refresh (más permisivo)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // 50 peticiones por IP
  message: { success: false, message: 'Demasiadas solicitudes de autenticación' }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dwellings', dwellingsRoutes);
app.use('/api/communities', communitiesRoutes);
app.use('/api/residents', residentsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/letters', lettersRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/profile-changes', pendingProfileChangeRoutes);
app.use('/api/dwelling-changes', pendingDwellingChangeRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// SPA catch-all - return index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Documentación Swagger en http://localhost:${PORT}/api-docs`);
    });
  })
  .catch(err => {
    console.error('Error conectando a MongoDB:', err);
    process.exit(1);
  });
