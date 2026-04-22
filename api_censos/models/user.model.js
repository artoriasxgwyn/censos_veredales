import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true
  },
  documentNumber: {
    type: String,
    trim: true
  },
  birthDate: {
    type: Date
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  signature: {
    type: String
  },
  digitalSignature: {
    type: String
  },
  password: {
    type: String
  },
  role: {
    type: String,
    enum: ['president', 'tesorero', 'secretario', 'residente', 'censista'],
    default: null
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices compuestos
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ documentNumber: 1, isActive: 1 });
userSchema.index({ communityId: 1, isActive: 1 });

export default mongoose.model('User', userSchema);
