import { ExpenseSplit } from './../models/expenseSplitSchema';
import { AuthenticatedRequest } from '../types/profile';
import { AsyncWrap } from '../utils/AsyncWrap';
import { Response } from 'express';
import { ErrorResponse } from '../utils/ErrorResponse';
import { SuccessResponse } from '../utils/SuccessResponse';
import { userIsExpenseCreatorOrAdmin } from '../services/expenseService';

const fetchExpenseSplit = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const { expense_id } = req.params;

    const existingSplit = await ExpenseSplit.find({
      expenseId: expense_id,
    }).select('userId -_id');
    const userIds = existingSplit.map((s) => s.userId.toString());
    const expenseSplits = await ExpenseSplit.find({ expenseId: expense_id });

    const isMemberOfSplit = userIds.includes(req.user._id.toString());
    if (!isMemberOfSplit) {
      throw new ErrorResponse(403, 'You are not Part of this Split');
    }

    if (!expenseSplits) {
      throw new ErrorResponse(404, 'Unable to find Spits of Expenses');
    }
    const totalAmount = expenseSplits.reduce(
      (sum, split) => Number(sum) + Number(split.amountOwed),
      0
    );
    const isExpenseSettled = expenseSplits.every(
      (split) => split.isSettled === true
    );
    res
      .status(200)
      .json(
        new SuccessResponse(
          200,
          { expenseSplits, totalAmount, isExpenseSettled },
          'Expense Split Fetched'
        )
      );
  }
);
const updateExpenseSplit = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || !req.user._id) {
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const { split_id } = req.params;
    const { amountOwed, isSettled } = req.body;
    const split = await ExpenseSplit.findById(split_id);
    if (!split) throw new ErrorResponse(404, 'Split not found');

    const isAuthorized = await userIsExpenseCreatorOrAdmin(
      req.user._id.toString(),
      split.expenseId.toString()
    );
    if (
      split.userId.toString() !== req.user._id.toString() && // not split owner
      !isAuthorized
    ) {
      throw new ErrorResponse(403, 'Not authorized to update this split');
    }

    const splitData = {} as { amountOwed?: string; isSettled?: boolean };
    if (amountOwed !== undefined) splitData.amountOwed = amountOwed;
    if (isSettled !== undefined) splitData.isSettled = isSettled;
    const expenseSplit = await ExpenseSplit.findByIdAndUpdate(
      split_id,
      splitData,
      { new: true }
    );
    if (!expenseSplit) {
      throw new ErrorResponse(404, 'Unable to update Expense Split');
    }
    res
      .status(200)
      .json(new SuccessResponse(200, { expenseSplit }, 'Split Update Success'));
  }
);

export { fetchExpenseSplit, updateExpenseSplit };
