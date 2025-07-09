import { ExpenseSplit } from './../models/expenseSplitSchema';
import { AuthenticatedRequest } from '../types/profile';
import { AsyncWrap } from '../utils/AsyncWrap';
import { Response } from 'express';
import { ErrorResponse } from '../utils/ErrorResponse';
import { SuccessResponse } from '../utils/SuccessResponse';

const fetchExpenseSplit = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    const { expense_id } = req.params;
    const expenseSplits = await ExpenseSplit.find({ expenseId: expense_id });

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
    const { split_id } = req.params;
    const { amountOwed, isSettled } = req.body;
    const splitData = {} as { amountOwed?: string; isSettled?: boolean };
    if (amountOwed !== undefined) splitData.amountOwed = amountOwed;
    if (isSettled !== undefined) splitData.isSettled = isSettled;
    const expenseSplit = await ExpenseSplit.findByIdAndUpdate(
      {
        _id: split_id,
      },
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
