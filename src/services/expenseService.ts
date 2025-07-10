import { Expense } from '../models/expenseSchema';
import { Member } from '../models/memberSchema';

// Returns true if user is expense creator or group admin
export const userIsExpenseCreatorOrAdmin = async (
  userId: string,
  expenseId: string
): Promise<boolean> => {
  // 1. Fetch the expense to get creator and groupId
  const expense = await Expense.findById(expenseId).select('createdBy groupId');
  if (!expense) return false;

  // 2. If user is the expense creator
  if (expense.createdBy && expense.createdBy.toString() === userId.toString()) return true;

  
  const member = await Member.findOne({
    userId,
    groupId: expense.groupId,
    role: 'admin',
  });
  return !!member; // true if found, false otherwise
};
