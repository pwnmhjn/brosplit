import { Types } from 'mongoose';
import { Member } from '../models/memberSchema';

export const areYouAdmin = async (arg: {
  userId: string;
  groupId: string;
}): Promise<boolean> => {
  if (!(arg.groupId || arg.userId)) return false;
  try {
    const member = await Member.findOne({
      groupId: arg.groupId,
      userId: arg.userId,
    });
    if (member && member.role === 'admin') {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
export const splitAmountBetweenGroupMembers = (args: {
  amount: string;
  userIds: Types.ObjectId[];
  expense_id: Types.ObjectId;
  loggedUserId: string;
}):
  | {
      amountOwed: string;
      userId: string;
      isSettled: boolean;
      expenseId: string;
    }[]
  | null => {
  if (args === null) return null;
  const averageSplitAmount = Number(args.amount) / args.userIds.length;
  const splitData = args.userIds.map((userId) => {
    if (userId.toString() === args.loggedUserId) {
      return {
        expenseId: args.expense_id.toString(),
        amountOwed: String(0),
        userId: userId.toString(),
        isSettled: true,
      };
    } else {
      return {
        expenseId: args.expense_id.toString(),
        amountOwed: String(averageSplitAmount),
        userId: userId.toString(),
        isSettled: false,
      };
    }
  });
  return splitData;
};
