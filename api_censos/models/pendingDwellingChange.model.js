import mongoose from 'mongoose';

const pendingDwellingChangeSchema = new mongoose.Schema({
  dwellingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dwelling',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  requestedChanges: {
    houseNomenclature: String,
    arrivalInstructions: String,
    mapLocation: String,
    constructionDate: Date,
    homePhoto: String,
    cedulaPropietario: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedByPresident: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBySecretary: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedByTreasurer: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Hook: actualizar status según las aprobaciones
pendingDwellingChangeSchema.post('save', async function(doc) {
  const approvals = [doc.approvedByPresident, doc.approvedBySecretary, doc.approvedByTreasurer];
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

// Índices
pendingDwellingChangeSchema.index({ dwellingId: 1, status: 1 });
pendingDwellingChangeSchema.index({ communityId: 1, status: 1 });
pendingDwellingChangeSchema.index({ requestedBy: 1, status: 1 });

export default mongoose.model('PendingDwellingChange', pendingDwellingChangeSchema);
