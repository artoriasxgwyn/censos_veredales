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
  cedulaPropietario: {
    type: String,
    trim: true
  },
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    null: true,
    default: null
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
dwellingSchema.index({ ownerUserId: 1, isActive: 1 });
dwellingSchema.index({ communityId: 1, isActive: 1 });

export default mongoose.model('Dwelling', dwellingSchema);
