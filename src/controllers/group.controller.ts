import { Response } from 'express';
import { Group } from '../models/groupSchema';
import { AuthenticatedRequest } from '../types/profile';
import { AsyncWrap } from '../utils/AsyncWrap';
import { checkReqBody } from '../utils/checkReqBody';
import { ErrorResponse } from '../utils/ErrorResponse';
import { SuccessResponse } from '../utils/SuccessResponse';
import { CreateGroupRequestBody, UpdateGroupRequestBody } from '../types/group';

const createGroup = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, description } = req.body as CreateGroupRequestBody;
    const { isThere, missingKey } = checkReqBody({ name, description });
    if (!isThere) {
      throw new ErrorResponse(400, `Please Enter ${missingKey}`);
    }
    if (!req.user) {
      throw new ErrorResponse(400, `User is Not Authenticated`);
    }
    const userId = req.user?._id;
    const group = await Group.create({
      name,
      description,
      createdBy: userId,
    });

    if (!group) {
      throw new ErrorResponse(400, 'Unable to create Group');
    }
    res.status(201).json(new SuccessResponse(201, { group }));
  }
);
const fetchGroups = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(200, 'User is not Authenticated');
    }
    const groups = await Group.find();
    if (!groups) {
      throw new ErrorResponse(200, 'could not find groups');
    }
    res.status(200).json(new SuccessResponse(200, { groups }));
  }
);
const fetchGroupDetails = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(200, 'User is not Authenticated');
    }
    const group_id = req.params.group_id;
    const group = await Group.findById(group_id);
    if (!group) {
      throw new ErrorResponse(200, 'could not find group');
    }
    res.status(200).json(new SuccessResponse(200, { group }));
  }
);
const destroyGroup = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(200, 'User is not Authenticated');
    }
    const group_id = req.params.group_id;
    const group = await Group.findByIdAndDelete(group_id);
    if (!group) {
      throw new ErrorResponse(200, 'could not delete group');
    }
    res
      .status(200)
      .json(new SuccessResponse(200, { group }, 'Group deletion successfully'));
  }
);
const updateGroup = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, description } = req.body as UpdateGroupRequestBody;
    if (!req.user) {
      throw new ErrorResponse(400, `User is Not Authenticated`);
    }
    const group_id = req.params.group_id;
    const updateGroupData: UpdateGroupRequestBody = {};
    if (name !== undefined) updateGroupData.name = name;
    if (description !== undefined) updateGroupData.description = description;
    const group = await Group.findByIdAndUpdate(
      { _id: group_id },
      { $set: updateGroupData },
      { new: true }
    );
    if (!group) {
      throw new ErrorResponse(400, 'Unable to update Group');
    }
    res
      .status(201)
      .json(new SuccessResponse(201, { group }, 'Group update Successfully'));
  }
);
export {
  createGroup,
  fetchGroups,
  fetchGroupDetails,
  destroyGroup,
  updateGroup,
};
