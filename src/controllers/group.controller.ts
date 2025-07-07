import { Response } from 'express';
import { Group } from '../models/groupSchema';
import { AuthenticatedRequest } from '../types/profile';
import { AsyncWrap } from '../utils/AsyncWrap';
import { checkReqBody } from '../utils/checkReqBody';
import { ErrorResponse } from '../utils/ErrorResponse';
import { SuccessResponse } from '../utils/SuccessResponse';
import { CreateGroupRequestBody, UpdateGroupRequestBody } from '../types/group';
import { Member } from '../models/memberSchema';
import { areYouAdmin } from '../services/groupService';

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
const addMember = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    const { role, userId } = req.body;
    const group_id = req.params.group_id;
    if (!req.user) {
      throw new ErrorResponse(200, 'User is not Authenticated');
    }
    const { isThere, missingKey } = checkReqBody({ role, userId });
    if (!isThere) {
      throw new ErrorResponse(400, `Please Enter ${missingKey}`);
    }
    const member = await Member.create({
      role: role,
      userId: userId,
      groupId: group_id,
    });
    if (!member) {
      throw new ErrorResponse(400, 'Unable to add member to the Group');
    }
    res
      .status(200)
      .json(new SuccessResponse(200, { member }, 'Member Added to the Group'));
  }
);
const fetchGroupMembers = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    const group_id = req.params.group_id;
    if (!req.user) {
      throw new ErrorResponse(200, 'User is not Authenticated');
    }
    const members = await Member.find({ groupId: group_id });
    if (!members) {
      throw new ErrorResponse(400, 'Could not Fetch Users');
    }
    res
      .status(200)
      .json(
        new SuccessResponse(200, { members }, 'Members Fetching Successful')
      );
  }
);
const updateGroupMember = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    const { role } = req.body;
    const { member_id, group_id } = req.params;
    if (!req.user) {
      throw new ErrorResponse(400, `User is Not Authenticated`);
    }
    const isAdmin = await areYouAdmin({
      userId: req.user._id.toString(),
      groupId: group_id,
    });
    if (!isAdmin) {
      throw new ErrorResponse(400, `Only Admin can Update Members`);
    }
    const { isThere, missingKey } = checkReqBody({ role });
    if (!isThere) {
      throw new ErrorResponse(400, `Please Enter ${missingKey}`);
    }
    if (!req.user) {
      throw new ErrorResponse(200, 'User is not Authenticated');
    }
    const member = await Member.findByIdAndUpdate(
      member_id,
      {
        $set: { role: role },
      },
      { new: true, runValidators: true }
    );
    if (!member) {
      throw new ErrorResponse(400, 'Could not Update Member');
    }
    res
      .status(200)
      .json(new SuccessResponse(200, { member }, 'Member update Successful'));
  }
);
const destroyGroupMember = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    const { member_id, group_id } = req.params;
    if (!req.user) {
      throw new ErrorResponse(200, 'User is not Authenticated');
    }
    const isAdmin = await areYouAdmin({
      userId: req.user._id.toString(),
      groupId: group_id,
    });
    if (!isAdmin) {
      throw new ErrorResponse(400, `Only Admin can Update Members`);
    }
    const member = await Member.findByIdAndDelete(member_id);
    if (!member) {
      throw new ErrorResponse(400, 'Could not Update Member');
    }
    res
      .status(200)
      .json(new SuccessResponse(200, { member }, 'Member Delete Successful'));
  }
);
export {
  createGroup,
  fetchGroups,
  fetchGroupDetails,
  destroyGroup,
  updateGroup,
  addMember,
  fetchGroupMembers,
  updateGroupMember,
  destroyGroupMember,
};
