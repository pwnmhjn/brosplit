import { Response } from 'express';
import { Group } from '../models/groupSchema';
import { AuthenticatedRequest } from '../types/profile';
import { AsyncWrap } from '../utils/AsyncWrap';
import { checkReqBody } from '../utils/checkReqBody';
import { ErrorResponse } from '../utils/ErrorResponse';
import { SuccessResponse } from '../utils/SuccessResponse';
import { CreateGroupRequestBody, UpdateGroupRequestBody } from '../types/group';
import { Member } from '../models/memberSchema';
import { splitAmountBetweenGroupMembers } from '../services/groupService';
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
    const groups = await Group.find();
    if (!groups) {
      throw new ErrorResponse(404, 'could not find groups');
    }
    res.status(200).json(new SuccessResponse(200, { groups }));
  }
);
const fetchGroupDetails = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const group_id = req.params.group_id;
    const group = await Group.findById(group_id);
    if (!group) {
      throw new ErrorResponse(404, 'could not find group');
    }
    res.status(200).json(new SuccessResponse(200, { group }));
  }
);
const destroyGroup = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const group_id = req.params.group_id;
    const group = await Group.findByIdAndDelete(group_id);
    if (!group) {
      throw new ErrorResponse(404, 'could not delete group');
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
    const group = await Group.findByIdAndUpdate(
      { _id: group_id },
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
    res
      .status(200)
      .json(
        new SuccessResponse(
          200,
          { expense, expenseSplit },
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
    const expenses = await Expense.find({ groupId: group_id });
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
    const expense = await Expense.find({ groupId: group_id, _id: expense_id });
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
    if (!req.user) {
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const { expense_id, group_id } = req.params;
    const { description, amount } = req.body as UpdateExpenseRequestBody;

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
    const expense = await Expense.findOneAndDelete({
      groupId: group_id,
      _id: expense_id,
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
