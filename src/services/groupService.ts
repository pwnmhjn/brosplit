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
export const addRoleInFetchGroupResponse = (
  members: {
    groupId: Types.ObjectId;
    _id: Types.ObjectId;
    role: string;
  }[],
  groups: { _id: Types.ObjectId; name: string }[]
): { _id: Types.ObjectId; name: string; role: string }[] => {
  const roleByGroupId: Record<string, string> = {};
  members.map((m) => {
    roleByGroupId[m.groupId.toString()] = m.role;
  });
  const groupWithRole = groups.map((group) => ({
    _id: group._id,
    name: group.name,
    role: roleByGroupId[group._id.toString()],
  }));
  return groupWithRole;
};
