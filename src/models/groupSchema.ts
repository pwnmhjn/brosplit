import mongoose, { Schema } from 'mongoose';
import { Member } from './memberSchema';
import { ErrorResponse } from '../utils/ErrorResponse';

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
groupSchema.post('save', async (doc, next) => {
  try {
    const member = await Member.create({
      groupId: doc?._id,
      role: 'admin',
      userId: doc?.createdBy,
    });
    if (!member) {
      throw new ErrorResponse(400, 'Member Creation Failed');
    }
    next();
  } catch {
    next(new ErrorResponse(400, 'Member Creation Failed'));
  }
});
groupSchema.pre('findOneAndDelete', async function (next) {
  try {
    const group = await this.model.findOne(this.getFilter());
    if (group) {
      await Member.deleteMany({ groupId: group._id });
    }
    next();
  } catch {
    next(
      new ErrorResponse(
        400,
        'could not delete member which are added in the group'
      )
    );
  }
});
export const Group = mongoose.model('Group', groupSchema);
