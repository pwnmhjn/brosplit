import mongoose, { Schema } from 'mongoose';

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

export const Expense = mongoose.model('Expense', expenseSchema);
