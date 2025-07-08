export interface CreateExpenseRequestBody {
  description: string;
  currency: string;
  amount: string;
  date: string;
}
export interface UpdateExpenseRequestBody {
  description?: string;
  amount?: string;
}
