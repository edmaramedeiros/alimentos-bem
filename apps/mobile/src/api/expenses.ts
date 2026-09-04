import { apiRequest } from '@/api/client';
import type { Expense, ExpenseCategory } from '@/api/types';

export function listExpenses(): Promise<Expense[]> {
  return apiRequest<Expense[]>('/api/expenses');
}

export type CreateExpenseInput = {
  creditorName: string;
  category: ExpenseCategory;
  expenseDate: string;
  payingCompanyName: string;
  amount: number;
};

export function createExpense(input: CreateExpenseInput): Promise<Expense> {
  return apiRequest<Expense>('/api/expenses', { method: 'POST', body: input });
}
