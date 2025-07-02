import { Response } from "express";
import { AsyncWrap } from "../utils/AsyncWrap";
import { checkReqBody } from "../utils/checkReqBody";
import { ErrorResponse } from "../utils/ErrorResponse";
import { Profile } from "../models/profileSchema";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { cloudinary } from "../config/cloudinary.config";
import {
  AuthenticatedRequest,
  CreateProfileRequestBody,
} from "../types/profile";
import { SuccessResponse } from "../utils/SuccessResponse";

const createProfile = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    const { firstname, lastname, contact, bio, gender, currency, location } =
      req.body as CreateProfileRequestBody;
    const { isThere, missingKey } = checkReqBody({
      firstname,
      lastname,
      contact,
      gender,
    });
    if (!isThere) {
      throw new ErrorResponse(400, `Please enter ${missingKey}`);
    }
    let cloudinaryAvatar;
    try {
      const user = req.user;
      const avatarPath = req.file?.path;
      if (avatarPath) {
        cloudinaryAvatar = await uploadOnCloudinary(avatarPath);
      }
      if (!cloudinaryAvatar?.url) {
        throw new ErrorResponse(400, `Could not uplaod Avatar`);
      }
      const userforDb = {
        firstname,
        lastname,
        avatar: cloudinaryAvatar?.url,
        contact,
        bio,
        gender,
        currency: currency?.toLowerCase(),
        location,
        user: user?._id,
      };
      const existingProfile = await Profile.findOne({
        user: user?._id,
        firstname: firstname,
      });
      if (existingProfile) {
        throw new ErrorResponse(400, "User Already Exist");
      }
      const profile = await Profile.create(userforDb);
      res
        .status(200)
        .json(
          new SuccessResponse(200, { profile }, "Profile Created Successfully")
        );
    } catch (error) {
      if (cloudinaryAvatar?.public_id) {
        try {
          await cloudinary.uploader.destroy(cloudinaryAvatar.public_id);
        } catch {
          throw new ErrorResponse(
            400,
            "Cloudnt destroy avatar after profile creation fail"
          );
        }
      }
      throw error;
    }
  }
);

export { createProfile };
