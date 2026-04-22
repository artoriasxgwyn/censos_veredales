import jwt from 'jsonwebtoken';
import Role from '../models/role.model.js';

// Middleware para verificar token de acceso
export const auth = (req, res, next) => {
  try {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.communityId = decoded.communityId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware para verificar rol específico
export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({
        success: false,
        message: 'Rol no disponible. Por favor inicia sesión nuevamente.'
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware para verificar si es presidente
export const isPresident = (req, res, next) => {
  if (req.userRole !== 'president') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de presidente.'
    });
  }
  next();
};

// Middleware para verificar permisos
export const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      // El presidente tiene todos los permisos por defecto
      if (req.userRole === 'president') {
        return next();
      }

      // Si no hay communityId, no hay permisos
      if (!req.communityId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes una comunidad asignada'
        });
      }

      // Buscar el rol del usuario en su comunidad
      const role = await Role.findOne({
        communityId: req.communityId,
        name: req.userRole,
        isActive: true
      });

      if (!role) {
        return res.status(403).json({
          success: false,
          message: 'Rol no encontrado o inactivo en esta comunidad'
        });
      }

      // Verificar si el rol tiene el permiso solicitado
      const resourcePermissions = role.permissions[resource];
      if (!resourcePermissions || !resourcePermissions[action]) {
        return res.status(403).json({
          success: false,
          message: `Permiso denegado: ${resource}.${action}`
        });
      }

      // Guardar el rol encontrado para uso posterior
      req.userRoleDoc = role;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
};

// Middleware para verificar si el usuario pertenece a la comunidad correcta
export const checkCommunityAccess = (communityIdField = 'communityId') => {
  return async (req, res, next) => {
    try {
      // El presidente puede acceder a cualquier recurso de su comunidad
      if (req.userRole === 'president') {
        return next();
      }

      const targetCommunityId = req.params[communityIdField] || req.body[communityIdField];

      if (!targetCommunityId) {
        return res.status(400).json({
          success: false,
          message: 'No se pudo determinar la comunidad objetivo'
        });
      }

      // Verificar que la comunidad objetivo coincide con la comunidad del usuario
      if (targetCommunityId !== req.communityId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a recursos de esta comunidad'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
};
