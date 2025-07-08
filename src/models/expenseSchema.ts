import mongoose, { Schema } from 'mongoose';
import { ErrorResponse } from '../utils/ErrorResponse';
import { ExpenseSplit } from './expenseSplitSchema';

const expenseSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    amount: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      enum: ['inr', 'usd', 'eur', 'rub', 'cny', 'gbp'],
      default: 'inr',
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

expenseSchema.pre('findOneAndDelete', async function (next) {
  try {
    const expense = await this.model.findOne(this.getFilter());
    if (expense) {
      await ExpenseSplit.deleteMany({ expenseId: expense._id });
    }
    next();
  } catch {
    next(
      new ErrorResponse(
        400,
        'could not delete member which are added in the group'
      )
    );
  }
});

export const Expense = mongoose.model('Expense', expenseSchema);
