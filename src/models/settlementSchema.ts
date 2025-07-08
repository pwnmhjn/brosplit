import mongoose, { Schema } from 'mongoose';

const settlementSchema = new Schema({
  fromUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
  },
});

export const Settlement = mongoose.model('Settlement', settlementSchema);
