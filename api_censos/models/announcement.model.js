import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  header: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  publishedAt: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

announcementSchema.index({ communityId: 1, publishedAt: -1 });

export default mongoose.model('Announcement', announcementSchema);
