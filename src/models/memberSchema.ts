import mongoose, { Schema } from 'mongoose';

const memberSchema = new Schema({
  role: {
    type: String,
    required: true,
    enum: ['admin', 'member'],
    default: 'member',
  },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

export const Member = mongoose.model('Member', memberSchema);
