import mongoose, { Schema } from 'mongoose';
import { ExpenseSplit } from './expenseSplitSchema';

const settlementSchema = new Schema({
  fromUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expenseId: {
    type: Schema.Types.ObjectId,
    ref: 'Expense',
    required: true,
  },
  toUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
  },
});
settlementSchema.post('save', async (doc, next) => {
  const split = await ExpenseSplit.findOne({
    expenseId: doc.expenseId,
    userId: doc.fromUserId,
  });
  if (split) {
    const newAmountOwed = Math.max(
      Number(split.amountOwed) - Number(doc.amount),
      0
    );
    const isSettled = newAmountOwed === 0;
    await ExpenseSplit.findByIdAndUpdate(split._id, {
      amountOwed: newAmountOwed,
      isSettled,
    });
  }
  next();
});
export const Settlement = mongoose.model('Settlement', settlementSchema);
