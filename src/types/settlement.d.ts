export interface CreateSettlementReqBody {
  fromUserId?: string;
  toUserId: string;
  note?: string;
  date?: string;
  groupId?: string;
  amount: string;
}
