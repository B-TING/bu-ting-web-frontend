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
