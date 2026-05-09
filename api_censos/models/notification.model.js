import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  type: {
    type: String,
    enum: [
      'profile_change',
      'password_change',
      'dwelling_change',
      'resident_approval',
      'dwelling_approval',
      'letter_approval',
      'announcement',
      'general'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  entity: {
    type: String,
    enum: ['user', 'resident', 'dwelling', 'letter', 'profile', 'password', 'announcement']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  read: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Índices para consultas rápidas
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ communityId: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
