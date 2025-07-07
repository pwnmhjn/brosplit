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
