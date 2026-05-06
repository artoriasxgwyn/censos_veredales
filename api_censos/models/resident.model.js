import mongoose from 'mongoose';

const residentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dwellingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dwelling',
    required: true
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    trim: true,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected']
  },
  // Triple validación - cada uno puede ser: 'pending', 'approved', 'rejected'
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
  registrationNumber: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices compuestos
residentSchema.index({ userId: 1, isActive: 1 });
residentSchema.index({ dwellingId: 1, isActive: 1 });
residentSchema.index({ communityId: 1, isActive: 1 });

// Pre-save hook para generar registrationNumber automático por comunidad
residentSchema.pre('save', async function(next) {
  if (!this.registrationNumber) {
    const count = await this.constructor.countDocuments({
      communityId: this.communityId
    });
    this.registrationNumber = `RES-${this.communityId}-${count + 1}`;
  }
  next();
});

// Hook: actualizar rol de usuario cuando los 3 admins aprueban
residentSchema.post('save', async function(doc) {
  const approvals = [doc.approvedByPresident, doc.approvedByTreasurer, doc.approvedBySecretary];
  const allApproved = approvals.every(a => a === 'approved');

  if (allApproved && doc.status === 'approved') {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(doc.userId, { role: 'residente' });
  }
});

export default mongoose.model('Resident', residentSchema);
