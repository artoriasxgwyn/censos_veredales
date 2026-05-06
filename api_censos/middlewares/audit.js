import AuditLog from '../models/auditLog.model.js';

/**
 * Middleware para logging de auditoría
 * Se usa en rutas que modifican datos (POST, PUT, DELETE)
 *
 * @param {string} entity - Tipo de entidad (resident, dwelling, letter, etc.)
 * @param {string} action - Acción (create, update, delete, approve, reject)
 */
export const auditLog = (entity, action) => {
  return async (req, res, next) => {
    // Guardar referencia al método json original
    const originalJson = res.json;

    res.json = async function(data) {
      try {
        // Esperar a que la respuesta se procese
        const result = originalJson.call(this, data);

        // Extraer información del request
        const entityId = req.params.id || req.body._id || req.body.userId || req.body.residentId;

        // Solo loguear si hay entityId
        if (entityId) {
          await AuditLog.create({
            userId: req.userId,
            action,
            entity,
            entityId,
            oldValues: req.body.oldValues || null,
            newValues: req.validatedBody || req.body || null,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            communityId: req.communityId
          });
        }

        return result;
      } catch (error) {
        console.error('Error en auditLog middleware:', error);
        // No bloquear la respuesta por error en auditoría
        // Response ya fue enviada arriba; no llamar json() de nuevo
        return;
      }
    };

    next();
  };
};

/**
 * Función helper para loguear auditoría manualmente desde controllers
 */
export const logAudit = async ({ userId, action, entity, entityId, oldValues, newValues, communityId, ipAddress }) => {
  try {
    await AuditLog.create({
      userId,
      action,
      entity,
      entityId,
      oldValues: oldValues || null,
      newValues: newValues || null,
      ipAddress: ipAddress || null,
      communityId
    });
  } catch (error) {
    console.error('Error al crear log de auditoría:', error);
  }
};
