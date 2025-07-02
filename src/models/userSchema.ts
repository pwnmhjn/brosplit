import mongoose, { Types, Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  refreshToken?: string;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateRefreshToken(): string;
  generateAccessToken(): string;
}
const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is Required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (
  this: IUser,
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateRefreshToken = function (this: IUser): string {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error("REFRESH_TOKEN_SECRET environment variable is not defined");
  }
  const refreshToken = jwt.sign({ _id: this._id.toString() }, secret, {
    expiresIn: "7d",
  });
  return refreshToken;
};

userSchema.methods.generateAccessToken = function (this: IUser): string {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET environment variable is not defined");
  }
  const accessToken = jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    secret,
    { expiresIn: "1h" }
  );
  return accessToken;
};

export const User = mongoose.model<IUser>("User", userSchema);
