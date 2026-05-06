import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  neighborhood: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  communityHallAddress: {
    type: String,
    trim: true
  },
  mapLocation: {
    type: String,
    trim: true
  },
  estimatedResidentCount: {
    type: Number,
    default: 0
  },
  presidentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  treasurerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  secretaryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  presidentWhatsApp: {
    type: String,
    trim: true
  },
  secretaryWhatsApp: {
    type: String,
    trim: true
  },
  treasurerWhatsApp: {
    type: String,
    trim: true
  },
  code: {
    type: String,
    unique: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices compuestos
communitySchema.index({ city: 1, isActive: 1 });
communitySchema.index({ neighborhood: 1, isActive: 1 });
communitySchema.index({ code: 1, isActive: 1 });

// Generar código único de 6 dígitos antes de guardar
communitySchema.pre('save', async function(next) {
  if (!this.code) {
    let code;
    let exists = true;
    while (exists) {
      code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
      const existing = await this.constructor.findOne({ code });
      exists = !!existing;
    }
    this.code = code;
  }
  next();
});

export default mongoose.model('Community', communitySchema);
