import mongoose from 'mongoose';

const dwellingSchema = new mongoose.Schema({
  houseNomenclature: {
    type: String,
    trim: true
  },
  arrivalInstructions: {
    type: String,
    trim: true
  },
  mapLocation: {
    type: String,
    trim: true
  },
  homeRegistrationDate: {
    type: Date,
    default: Date.now
  },
  constructionDate: {
    type: Date
  },
  homePhoto: {
    type: String
  },
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
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
dwellingSchema.index({ ownerUserId: 1, isActive: 1 });
dwellingSchema.index({ communityId: 1, isActive: 1 });

// Hook: actualizar estado según las aprobaciones
dwellingSchema.post('save', async function(doc) {
  const approvals = [doc.approvedByPresident, doc.approvedByTreasurer, doc.approvedBySecretary];
  const hasRejection = approvals.some(a => a === 'rejected');
  const allApproved = approvals.every(a => a === 'approved');

  let newStatus;
  if (hasRejection) {
    newStatus = 'rejected';
  } else if (allApproved) {
    newStatus = 'approved';
  } else {
    newStatus = 'pending';
  }

  if (doc.status !== newStatus) {
    await this.constructor.findByIdAndUpdate(doc._id, { status: newStatus });
  }
});

export default mongoose.model('Dwelling', dwellingSchema);
