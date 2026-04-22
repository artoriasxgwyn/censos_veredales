import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import dwellingsRoutes from './routes/dwelling.routes.js';
import communitiesRoutes from './routes/community.routes.js';
import residentsRoutes from './routes/resident.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import lettersRoutes from './routes/letter.routes.js';
import announcementsRoutes from './routes/announcement.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
      { name: 'Dwellings', description: 'Gestión de viviendas' },
      { name: 'Communities', description: 'Gestión de comunidades' },
      { name: 'Residents', description: 'Gestión de residentes' },
      { name: 'Letters', description: 'Gestión de cartas (normal y juramentada)' },
      { name: 'Announcements', description: 'Gestión de anuncios/comunicados' },
      { name: 'Dashboard', description: 'Dashboards de administrador y residente' }
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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Demasiadas solicitudes, intente más tarde' }
});
app.use('/api', limiter);

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

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Censos Veredales - Documentación en /api-docs'
  });
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
