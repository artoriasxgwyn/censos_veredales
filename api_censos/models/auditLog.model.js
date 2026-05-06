import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'approve', 'reject', 'assign_role', 'remove_role', 'login', 'logout']
  },
  entity: {
    type: String,
    required: true,
    enum: ['resident', 'dwelling', 'letter', 'user', 'role', 'announcement', 'community', 'approval']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  oldValues: {
    type: Object,
    default: null
  },
  newValues: {
    type: Object,
    default: null
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  }
}, {
  timestamps: true
});

// Índice para búsquedas rápidas por entidad y usuario
auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ communityId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
