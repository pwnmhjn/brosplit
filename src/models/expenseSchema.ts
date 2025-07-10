import mongoose, { Schema } from 'mongoose';
import { ErrorResponse } from '../utils/ErrorResponse';
import { ExpenseSplit } from './expenseSplitSchema';
import { Member } from './memberSchema';

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
expenseSchema.post('findOneAndUpdate', async function (doc, next) {
  if (!doc) next();
  const options = this.getOptions && this.getOptions();
  if (options && options.skipSplitUpdate) {
    return next();
  }
  try {
    const updatedAmount = doc.amount;
    const expenseId = doc._id;
    const members = await Member.find({ groupId: doc.groupId });
    const splitAmount = updatedAmount / members.length;
    const newSplits = members.map((member) => ({
      expenseId,
      userId: member.userId,
      amountOwed: member.role === 'admin' ? '0' : splitAmount,
      isSettled: member.role === 'admin' ? true : false,
    }));
    await ExpenseSplit.deleteMany({ expenseId });
    await ExpenseSplit.insertMany(newSplits);
  } catch {
    next(
      new ErrorResponse(400, 'unable to update Splits after expense update')
    );
  }
});

export const Expense = mongoose.model('Expense', expenseSchema);
