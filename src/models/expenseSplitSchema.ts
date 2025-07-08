import mongoose, { Schema } from 'mongoose';
import { Expense } from './expenseSchema';
import { ErrorResponse } from '../utils/ErrorResponse';

const expenseSplitSchema = new Schema(
  {
    expenseId: {
      type: Schema.Types.ObjectId,
      ref: 'Expense',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amountOwed: {
      type: String,
      required: true,
    },
    isSettled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

expenseSplitSchema.post(
  ['updateMany', 'findOneAndUpdate'],
  async function (res, next) {
    const expenseId = this.getQuery().expenseId || res.expenseId;
    if (!expenseId) next();
    try {
      const splits = await this.model.find({ expenseId });
      const newAmount = splits.reduce(
        (sum, split) => Number(sum) + Number(split.amountOwed),
        0
      );
      const expense = await Expense.findByIdAndUpdate(expenseId, {
        amount: newAmount,
      });
      if (!expense) {
        throw new ErrorResponse(
          200,
          'unable to update expense after one split update'
        );
      }
      next();
    } catch {
      next(
        new ErrorResponse(
          200,
          'unable to update expense after one split update'
        )
      );
    }
  }
);
export const ExpenseSplit = mongoose.model('ExpenseSplit', expenseSplitSchema);
