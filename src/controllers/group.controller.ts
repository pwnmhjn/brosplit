import { Response } from 'express';
import { Group } from '../models/groupSchema';
import { AuthenticatedRequest } from '../types/profile';
import { AsyncWrap } from '../utils/AsyncWrap';
import { checkReqBody } from '../utils/checkReqBody';
import { ErrorResponse } from '../utils/ErrorResponse';
import { SuccessResponse } from '../utils/SuccessResponse';
import { CreateGroupRequestBody, UpdateGroupRequestBody } from '../types/group';
import { Member } from '../models/memberSchema';
import {
  addRoleInFetchGroupResponse,
  splitAmountBetweenGroupMembers,
} from '../services/groupService';
import { Expense } from '../models/expenseSchema';
import {
  CreateExpenseRequestBody,
  UpdateExpenseRequestBody,
} from '../types/expense';
import { ExpenseSplit } from '../models/expenseSplitSchema';

const createGroup = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, description } = req.body as CreateGroupRequestBody;
    const { isThere, missingKey } = checkReqBody({ name, description });
    if (!isThere) {
      throw new ErrorResponse(400, `Please Enter ${missingKey}`);
    }
    if (!req.user) {
      throw new ErrorResponse(401, `User is Not Authenticated`);
    }
    const userId = req.user?._id;
    const group = await Group.create({
      name,
      description,
      createdBy: userId,
    });

    if (!group) {
      throw new ErrorResponse(404, 'Unable to create Group');
    }
    res.status(201).json(new SuccessResponse(201, { group }));
  }
);
const fetchGroups = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const IAmAsAMemberOrAdmin = await Member.find({
      userId: req.user._id,
    }).select('groupId role');

    const groupIds = IAmAsAMemberOrAdmin.map((member) => member.groupId);
    const groups = await Group.find({ _id: { $in: groupIds } }).select(
      '_id name'
    );
    if (groups.length < 1) {
      throw new ErrorResponse(404, 'could not find groups');
    }
    const groupWithRole = addRoleInFetchGroupResponse(
      IAmAsAMemberOrAdmin,
      groups
    );
    res.status(200).json(new SuccessResponse(200, { groups: groupWithRole }));
  }
);
const fetchGroupDetails = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const group_id = req.params.group_id;
    const IAmAsAMemberOrAdmin = await Member.findOne({
      userId: req.user._id,
      groupId: group_id,
    }).select('groupId');
    const group = await Group.findOne({
      _id: IAmAsAMemberOrAdmin?.groupId,
    });
    if (!group) {
      throw new ErrorResponse(404, 'could not find group');
    }
    const groupWithRole = {
      ...group.toObject(),
      role:
        group.createdBy.toString() === req.user._id.toString()
          ? 'Admin'
          : 'Member',
    };
    res.status(200).json(new SuccessResponse(200, { group: groupWithRole }));
  }
);
const destroyGroup = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const group_id = req.params.group_id;
    const group = await Group.findOneAndDelete({
      _id: group_id,
      createdBy: req.user._id,
    });
    if (!group || group.createdBy === req.user._id) {
      throw new ErrorResponse(404, 'You have no Access to Delete This group');
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
      throw new ErrorResponse(401, `User is Not Authenticated`);
    }
    const group_id = req.params.group_id;
    const updateGroupData: UpdateGroupRequestBody = {};
    if (name !== undefined) updateGroupData.name = name;
    if (description !== undefined) updateGroupData.description = description;
    const isThereGroup = await Group.findOne({
      _id: group_id,
      createdBy: req.user._id,
    });
    if (!isThereGroup) {
      throw new ErrorResponse(403, 'You have no Access to update this group');
    }
    const group = await Group.findOneAndUpdate(
      { _id: group_id, createdBy: req.user._id },
      { $set: updateGroupData },
      { new: true }
    );
    if (!group) {
      throw new ErrorResponse(404, 'Unable to update Group');
    }
    res
      .status(201)
      .json(new SuccessResponse(201, { group }, 'Group update Successfully'));
  }
);
const createExpense = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    const { group_id } = req.params;
    if (!req.user) {
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const userId = req.user._id;
    const { description, currency, amount, date } =
      req.body as CreateExpenseRequestBody;
    const { isThere, missingKey } = checkReqBody({
      description,
      currency,
      amount,
      date,
    });
    if (!isThere) {
      throw new ErrorResponse(400, `Please Enter ${missingKey}`);
    }
    const isMember = await Member.findOne({
      userId: req.user._id,
      groupId: group_id,
    });
    if (!isMember) {
      throw new ErrorResponse(
        403,
        'You are not part of this group to create Expense'
      );
    }
    const members = await Member.find({ groupId: group_id });
    if (!members) {
      throw new ErrorResponse(404, 'Unable to get Members to split amount');
    }
    const expense = await Expense.create({
      groupId: group_id,
      createdBy: userId,
      description,
      amount,
      currency,
      date,
    });

    if (!expense) {
      throw new ErrorResponse(404, 'Unable to create Expense');
    }
    const userIds = members.map((member) => member.userId);
    const arrayData = splitAmountBetweenGroupMembers({
      amount,
      userIds,
      expense_id: expense._id,
      loggedUserId: userId.toString(),
    });
    const expenseSplit = await ExpenseSplit.insertMany(arrayData);
    if (!expenseSplit) {
      throw new ErrorResponse(404, 'Unable to Split Expenses');
    }
    const expenseSplitMinimal = expenseSplit.map((split) => ({
      _id: split._id,
      expenseId: split.expenseId,
    }));
    res
      .status(200)
      .json(
        new SuccessResponse(
          200,
          { expense, expenseSplit: expenseSplitMinimal },
          'Expense Created Successfully'
        )
      );
  }
);
const fetchGroupExpense = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(402, 'User is not Authenticated');
    }
    const { group_id } = req.params;
    const members = await Member.find({ groupId: group_id }).select(
      'userId -_id'
    );
    const userIds = members.map((m) => m.userId.toString());
    const isMember = userIds.includes(req.user._id.toString());
    if (!isMember) {
      throw new ErrorResponse(
        403,
        'You have no Access to Fetch Expense from this Group'
      );
    }

    const expenses = await Expense.find({ groupId: group_id }).select(
      'description amount'
    );
    if (!expenses) {
      throw new ErrorResponse(404, 'could not find Expenses');
    }
    res
      .status(200)
      .json(
        new SuccessResponse(200, { expenses }, 'Expense Fetched Successfully')
      );
  }
);
const fetchGroupExpenseDetails = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const { group_id, expense_id } = req.params;

    const members = await Member.find({ groupId: group_id }).select(
      'userId -_id'
    );
    const userIds = members.map((m) => m.userId.toString());
    const isMember = userIds.includes(req.user._id.toString());
    if (!isMember) {
      throw new ErrorResponse(
        403,
        'You have no Access to Fetch Expense Details from this Group'
      );
    }

    const expense = await Expense.findOne({
      groupId: group_id,
      _id: expense_id,
    });
    if (!expense) {
      throw new ErrorResponse(404, 'Could not find Expense');
    }
    res
      .status(200)
      .json(
        new SuccessResponse(200, { expense }, 'Expense Fetched Successfully')
      );
  }
);
const updateGroupExpense = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    const { expense_id, group_id } = req.params;
    const { description, amount } = req.body as UpdateExpenseRequestBody;
    if (!req.user) {
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const members = await Member.find({ groupId: group_id }).select(
      'userId -_id'
    );
    const userIds = members.map((m) => m.userId.toString());
    const isMember = userIds.includes(req.user._id.toString());
    if (!isMember) {
      throw new ErrorResponse(403, 'You have no Access to Update this Expense');
    }
    const expenseData: UpdateExpenseRequestBody = {};
    if (description !== undefined) expenseData.description = description;
    if (amount !== undefined) expenseData.amount = amount;
    const expense = await Expense.findOneAndUpdate(
      {
        _id: expense_id,
        groupId: group_id,
      },
      expenseData,
      { new: true }
    );
    if (!expense) {
      throw new ErrorResponse(404, 'Unable to update Expense');
    }
    res
      .status(200)
      .json(new SuccessResponse(200, { expense }, 'Expense Update Successful'));
  }
);
const destroyGroupExpense = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const { group_id, expense_id } = req.params;
    const existingExpense = await Expense.findOne({
      groupId: group_id,
      _id: expense_id,
      createdBy: req.user._id,
    });
    if (!existingExpense) {
      throw new ErrorResponse(
        403,
        'You do not have Access To Delete this Expense'
      );
    }
    const expense = await Expense.findOneAndDelete({
      groupId: group_id,
      _id: expense_id,
      createdBy: req.user._id,
    });
    if (!expense) {
      throw new ErrorResponse(404, 'Unable to Delete Expense');
    }
    res
      .status(200)
      .json(
        new SuccessResponse(200, { expense }, 'Expense Deleted Successfully')
      );
  }
);

export {
  createGroup,
  fetchGroups,
  fetchGroupDetails,
  destroyGroup,
  updateGroup,
  createExpense,
  fetchGroupExpense,
  fetchGroupExpenseDetails,
  updateGroupExpense,
  destroyGroupExpense,
};
