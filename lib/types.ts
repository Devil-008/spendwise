export type ExpenseType = 'income' | 'expense';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: ExpenseType;
}

export interface Profile {
  name: string;
  avatar: string | null;
}

export interface Settings {
  darkMode: boolean;
  fontSize: number;
}

export const CATEGORIES = [
  { label: 'Food & Dining', value: 'food', icon: 'restaurant' as const },
  { label: 'Transport', value: 'transport', icon: 'car' as const },
  { label: 'Shopping', value: 'shopping', icon: 'cart' as const },
  { label: 'Entertainment', value: 'entertainment', icon: 'game-controller' as const },
  { label: 'Bills & Utilities', value: 'bills', icon: 'receipt' as const },
  { label: 'Health', value: 'health', icon: 'medkit' as const },
  { label: 'Education', value: 'education', icon: 'school' as const },
  { label: 'Salary', value: 'salary', icon: 'cash' as const },
  { label: 'Freelance', value: 'freelance', icon: 'laptop' as const },
  { label: 'Investment', value: 'investment', icon: 'trending-up' as const },
  { label: 'Gift', value: 'gift', icon: 'gift' as const },
  { label: 'Other', value: 'other', icon: 'ellipsis-horizontal' as const },
];

export const CATEGORY_COLORS: Record<string, string> = {
  food: '#EF4444',
  transport: '#3B82F6',
  shopping: '#8B5CF6',
  entertainment: '#F59E0B',
  bills: '#6366F1',
  health: '#EC4899',
  education: '#14B8A6',
  salary: '#10B981',
  freelance: '#06B6D4',
  investment: '#84CC16',
  gift: '#F97316',
  other: '#6B7280',
};

export function getCategoryLabel(value: string): string {
  return CATEGORIES.find(c => c.value === value)?.label || value;
}

export function getCategoryIcon(value: string): string {
  return CATEGORIES.find(c => c.value === value)?.icon || 'ellipsis-horizontal';
}
