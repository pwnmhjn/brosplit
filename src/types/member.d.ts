type UserRole = 'admin' | 'member';

export interface AddMemberRequestBody {
  role: UserRole;
  userId: string;
}
