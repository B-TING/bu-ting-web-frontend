export type ExpenseCategory =
  | 'food'
  | 'shopping'
  | 'accommodation'
  | 'transport'
  | 'experience'
  | 'other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  payer: string;
  splitWith: string[];
  memo: string;
}

export type ApiExpenseCategory =
  | 'FOOD'
  | 'TRANSPORT'
  | 'ACCOMMODATION'
  | 'ACTIVITY'
  | 'SHOPPING'
  | 'ETC';

export interface TravelExpenseCreateRequest {
  title: string;
  amount: number;
  currency?: string;
  category: ApiExpenseCategory;
  payerId: string;
  participantIds: string[];
  spentAt: string;
  memo?: string | null;
}

export interface TravelExpenseUserSummary {
  memberId: string;
  userId: string;
  nickname: string;
}

export interface TravelExpenseListItem {
  expenseId: string;
  title: string;
  amount: number;
  currency: string;
  category: ApiExpenseCategory;
  payer: TravelExpenseUserSummary;
  participantCount: number;
  spentAt: string;
  createdAt: string;
}

export interface TravelExpenseListResponse {
  content: TravelExpenseListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TravelExpenseCategorySummary {
  category: ApiExpenseCategory;
  amount: number;
  expenseCount: number;
  ratio: number;
}

export interface TravelExpenseMemberSummary {
  memberId: string;
  nickname: string;
  paidAmount: number;
  shareAmount: number;
  balance: number;
}

export interface TravelExpenseCurrencySummary {
  currency: string;
  totalAmount: number;
  categorySummaries: TravelExpenseCategorySummary[];
  memberSummaries: TravelExpenseMemberSummary[];
}

export interface TravelExpenseSummaryResponse {
  travelId: string;
  expenseCount: number;
  currencySummaries: TravelExpenseCurrencySummary[];
  from?: string | null;
  to?: string | null;
}

export interface TravelSettlementTransfer {
  currency: string;
  senderId: string;
  senderNickname: string;
  receiverId: string;
  receiverNickname: string;
  amount: number;
}

export interface TravelSettlementResponse {
  travelId: string;
  confirmed: boolean;
  confirmedById?: string | null;
  confirmedAt?: string | null;
  transfers: TravelSettlementTransfer[];
}
