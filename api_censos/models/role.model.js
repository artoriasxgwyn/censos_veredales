import mongoose from 'mongoose';

const permissionsSchema = new mongoose.Schema({
  // Residentes
  resident: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false }
  },
  // Viviendas
  dwelling: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false }
  },
  // Cartas
  letter: {
    generateNormal: { type: Boolean, default: false },
    generateJuramentada: { type: Boolean, default: false },
    confirmJuramentada: { type: Boolean, default: false },
    download: { type: Boolean, default: false },
    verifyQr: { type: Boolean, default: false }
  },
  // Dashboard
  dashboard: {
    access: { type: Boolean, default: false },
    scope: {
      type: String,
      enum: ['limited', 'full'],
      default: 'limited'
    }
  },
  // Gestión de usuarios
  user: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    changePassword: { type: Boolean, default: false },
    manageRoles: { type: Boolean, default: false }
  },
  // Comunidad
  community: {
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false }
  },
  // Avisos/Noticias
  announcement: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false }
  },
  // Roles
  role: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false }
  },
  // Exportaciones
  export: {
    residents: { type: Boolean, default: false },
    dwellings: { type: Boolean, default: false },
    letters: { type: Boolean, default: false },
    all: { type: Boolean, default: false }
  }
}, { _id: false });

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['president', 'secretario', 'tesorero', 'residente', 'censista', 'custom'],
    trim: true
  },
  customName: {
    type: String,
    trim: true,
    default: null  // Para roles personalizados (ej: "coordinador")
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  isBaseRole: {
    type: Boolean,
    default: false  // true para los 4 roles base
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: {
    type: permissionsSchema,
    default: () => ({
      resident: { create: false, read: false, update: false, delete: false },
      dwelling: { create: false, read: false, update: false, delete: false },
      letter: { generateNormal: false, generateJuramentada: false, confirmJuramentada: false, download: false, verifyQr: false },
      dashboard: { access: false, scope: 'limited' },
      user: { create: false, read: false, update: false, delete: false, changePassword: false, manageRoles: false },
      announcement: { create: false, read: false, update: false, delete: false },
      community: { read: false, update: false, delete: false },
      role: { create: false, read: false, update: false, delete: false },
      export: { residents: false, dwellings: false, letters: false, all: false }
    })
  }
}, {
  timestamps: true
});

// Índice único por comunidad y nombre de rol
roleSchema.index({ communityId: 1, name: 1, customName: 1 }, { unique: true });

// Método para verificar un permiso específico
roleSchema.methods.hasPermission = function(resource, action) {
  const resourcePermissions = this.permissions[resource];
  if (!resourcePermissions) return false;
  return resourcePermissions[action] === true;
};

export default mongoose.model('Role', roleSchema);
