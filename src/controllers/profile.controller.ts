import { Response } from 'express';
import { AsyncWrap } from '../utils/AsyncWrap';
import { checkReqBody } from '../utils/checkReqBody';
import { ErrorResponse } from '../utils/ErrorResponse';
import { Profile } from '../models/profileSchema';
import { uploadOnCloudinary } from '../utils/cloudinary';

import {
  AuthenticatedRequest,
  CreateProfileRequestBody,
  UpdateProfileRequestBody,
} from '../types/profile';
import { SuccessResponse } from '../utils/SuccessResponse';
import extractPublicIdFromURL from '../utils/extractPublicIdFromURL';
import { destroyCloudinaryUrl } from '../services/profileService';

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
      if (!user) {
        throw new ErrorResponse(400, 'User is Not Authenticated');
      }
      const avatarPath = req.file?.path;
      const existingProfile = await Profile.findOne({
        user: user?._id,
        firstname: firstname,
      });
      if (existingProfile) {
        throw new ErrorResponse(400, 'User Already Exist');
      }
      if (avatarPath) {
        cloudinaryAvatar = await uploadOnCloudinary(avatarPath);
      }
      const userForDb: Partial<CreateProfileRequestBody> & {
        user: typeof user._id;
      } = {
        firstname,
        lastname,
        contact,
        gender,
        user: user?._id,
      };
      if (bio !== undefined) userForDb.bio = bio;
      if (currency !== undefined) userForDb.currency = currency;
      if (location !== undefined) userForDb.location = location;
      const profile = await Profile.create(userForDb);
      if (!profile) {
        throw new ErrorResponse(400, 'Could not Create Profile');
      }
      res
        .status(200)
        .json(
          new SuccessResponse(200, { profile }, 'Profile Created Successfully')
        );
    } catch (error) {
      if (cloudinaryAvatar?.public_id) {
        const isDestroyed = destroyCloudinaryUrl({
          url: cloudinaryAvatar.public_id,
          type: 'create',
        });
        console.log(isDestroyed);
      }
      throw error;
    }
  }
);
const updateProfile = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (req.body) {
      const { firstname, lastname, contact, bio, gender, currency, location } =
        req.body as UpdateProfileRequestBody;
      if (!req.user) {
        throw new ErrorResponse(401, 'User not authenticated');
      }
      const userId = req.user._id;
      const existingProfile = await Profile.findOne({ user: userId });
      let old_public_id;
      if (existingProfile?.avatar) {
        old_public_id = extractPublicIdFromURL(existingProfile?.avatar);
      }

      const avatarPath = req.file?.path;
      let cloudinaryAvatar;
      if (avatarPath) {
        try {
          cloudinaryAvatar = await uploadOnCloudinary(avatarPath);
        } catch {
          throw new ErrorResponse(400, 'Could not upload profile');
        }
      }
      const updatableDataForFilter: UpdateProfileRequestBody = {};
      if (firstname !== undefined) updatableDataForFilter.firstname = firstname;
      if (lastname !== undefined) updatableDataForFilter.lastname = lastname;
      if (contact !== undefined) updatableDataForFilter.contact = contact;
      if (bio !== undefined) updatableDataForFilter.bio = bio;
      if (gender !== undefined) updatableDataForFilter.gender = gender;
      if (currency !== undefined) updatableDataForFilter.currency = currency;
      if (location !== undefined) updatableDataForFilter.location = location;
      if (cloudinaryAvatar?.url)
        updatableDataForFilter.avatar = cloudinaryAvatar.url;
      const updatedProfile = await Profile.findOneAndUpdate(
        { user: userId },
        { $set: updatableDataForFilter },
        { new: true }
      );
      if (!updatedProfile) {
        throw new ErrorResponse(401, 'Could not Create Profile');
      }
      if (updatedProfile && old_public_id) {
        await destroyCloudinaryUrl({
          url: old_public_id,
          type: 'update',
        });
      }
      res
        .status(200)
        .json(
          new SuccessResponse(
            200,
            { updatedProfile },
            'Profile Update Successfully'
          )
        );
    } else {
      throw new ErrorResponse(400, 'Field Is Missing');
    }
  }
);
const getProfiles = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
      throw new ErrorResponse(400, 'User is Not Authenticated');
    }
    try {
      const profiles = await Profile.find();
      res
        .status(200)
        .json(
          new SuccessResponse(200, profiles, 'Fetching profile Successfully')
        );
    } catch {
      throw new ErrorResponse(400, 'Cloud not find Profiles');
    }
  }
);
const destroyProfile = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(401, 'User not authenticated');
    }
    const userId = req.user._id;

    try {
      const deletedProfile = await Profile.findOneAndDelete({ user: userId });
      let publicIdForDelete;
      if (deletedProfile?.avatar) {
        publicIdForDelete = extractPublicIdFromURL(deletedProfile?.avatar);
      }
      if (deletedProfile && publicIdForDelete) {
        await destroyCloudinaryUrl({
          url: publicIdForDelete,
          type: 'update',
        });
      }
      res
        .status(200)
        .json(new SuccessResponse(200, deletedProfile, 'Profile got Deleted'));
    } catch {
      throw new ErrorResponse(400, 'Unable to Delete Profile');
    }
  }
);
export { createProfile, updateProfile, getProfiles, destroyProfile };
