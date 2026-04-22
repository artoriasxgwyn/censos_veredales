import mongoose from 'mongoose';

const letterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  type: {
    type: String,
    enum: ['normal', 'juramentada'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'issued'],
    default: 'pending'
  },
  approvedByPresident: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedByTreasurer: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBySecretary: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  pdfUrl: { type: String },
  qrUrl: { type: String },
  qrCodigo: { type: String, unique: true },
  issuedAt: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Índice para búsquedas por comunidad y usuario
letterSchema.index({ communityId: 1, userId: 1 });

export default mongoose.model('Letter', letterSchema);
