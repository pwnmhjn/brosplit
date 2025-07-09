import { Response } from 'express';
import { Member } from '../models/memberSchema';
import { AddMemberRequestBody } from '../types/member';
import { AuthenticatedRequest } from '../types/profile';
import { AsyncWrap } from '../utils/AsyncWrap';
import { checkReqBody } from '../utils/checkReqBody';
import { ErrorResponse } from '../utils/ErrorResponse';
import { SuccessResponse } from '../utils/SuccessResponse';
import { areYouAdmin } from '../services/groupService';
import { Group } from '../models/groupSchema';

const addMember = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    const { role, userId } = req.body as AddMemberRequestBody;
    const group_id = req.params.group_id;
    if (!req.user) {
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const { isThere, missingKey } = checkReqBody({ role, userId });
    if (!isThere) {
      throw new ErrorResponse(400, `Please Enter ${missingKey}`);
    }
    const group = await Group.findOne({
      _id: group_id,
      createdBy: req.user._id,
    });

    if (!group) {
      throw new ErrorResponse(
        403,
        'You do not have Access to add member to this Group'
      );
    }
    const exitingMember = await Member.find({ groupId: group_id, userId });
    if (exitingMember) {
      throw new ErrorResponse(409, 'Member is Already Added in This Group');
    }
    const member = await Member.create({
      role: role,
      userId: userId,
      groupId: group_id,
    });
    if (!member) {
      throw new ErrorResponse(500, 'Unable to add member to the Group');
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
      throw new ErrorResponse(401, 'User is not Authenticated');
    }

    const isMember = await Member.findOne({
      groupId: group_id,
      userId: req.user._id,
    });
    if (!isMember) {
      throw new ErrorResponse(403, 'You are not part of this Group');
    }
    const members = await Member.find({ groupId: group_id });
    if (!members) {
      throw new ErrorResponse(500, 'Could not Fetch Users');
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
      throw new ErrorResponse(401, `User is Not Authenticated`);
    }
    const isAdmin = await areYouAdmin({
      userId: req.user._id.toString(),
      groupId: group_id,
    });
    if (!isAdmin) {
      throw new ErrorResponse(403, `Only Admin can Update Members`);
    }
    const { isThere, missingKey } = checkReqBody({ role });
    if (!isThere) {
      throw new ErrorResponse(400, `Please Enter ${missingKey}`);
    }
    if (!req.user) {
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const member = await Member.findByIdAndUpdate(
      member_id,
      {
        $set: { role: role },
      },
      { new: true, runValidators: true }
    );
    if (!member) {
      throw new ErrorResponse(500, 'Could not Update Member');
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
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const isAdmin = await areYouAdmin({
      userId: req.user._id.toString(),
      groupId: group_id,
    });
    if (!isAdmin) {
      throw new ErrorResponse(403, `Only Admin can Update Members`);
    }
    const member = await Member.findByIdAndDelete(member_id);
    if (!member) {
      throw new ErrorResponse(500, 'Could not Update Member');
    }
    res
      .status(200)
      .json(new SuccessResponse(200, { member }, 'Member Delete Successful'));
  }
);

export { addMember, updateGroupMember, destroyGroupMember, fetchGroupMembers };
