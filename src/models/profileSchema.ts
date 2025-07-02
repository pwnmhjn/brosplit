import mongoose, { Types, Document, Schema } from "mongoose";

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
      ref: "User",
      required: [true, "UserId is Required In Profile"],
    },
    avatar: {
      type: String,
      default:
        "https://cdn.vectorstock.com/i/2000v/51/99/user-avatar-icon-flat-style-vector-3125199.avif",
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
      enum: ["male", "female", "other"],
      lowercase: true,
      trim: true,
      required: false,
    },
    currency: {
      type: String,
      enum: ["inr", "usd", "eur", "rub", "cny", "gbp"],
      default: "inr",
    },
    location: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);
export const Profile = mongoose.model("Profile", profileSchema);
