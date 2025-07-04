import mongoose, { Schema } from 'mongoose';
import { User } from './userSchema';
import { ErrorResponse } from '../utils/ErrorResponse';

const profileSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'UserId is Required In Profile'],
    },
    avatar: {
      type: String,
      default:
        'https://cdn.vectorstock.com/i/2000v/51/99/user-avatar-icon-flat-style-vector-3125199.avif',
      required: false,
    },
    contact: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      lowercase: true,
      trim: true,
      required: false,
    },
    currency: {
      type: String,
      enum: ['inr', 'usd', 'eur', 'rub', 'cny', 'gbp'],
      default: 'inr',
    },
    location: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

profileSchema.pre('findOneAndDelete', async function (next) {
  try {
    const profile = await this.model.findOne(this.getQuery());
    if (profile && profile.user) {
      await User.findByIdAndDelete(profile.user);
    }
    next();
  } catch {
    next(new ErrorResponse(400, 'cloud delete User Associate with Profile'));
  }
});
export const Profile = mongoose.model('Profile', profileSchema);
