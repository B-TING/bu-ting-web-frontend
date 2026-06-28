export type ExpenseCategory = '식비' | '쇼핑' | '숙박비' | '교통비' | '관람·체험' | '기타';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  payer: string;
  splitWith: string[];
  memo: string;
}
