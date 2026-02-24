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
  { label: 'Food & Dining', value: 'food', icon: 'fast-food-outline' as const },
  { label: 'Transport', value: 'transport', icon: 'bus-outline' as const },
  { label: 'Shopping', value: 'shopping', icon: 'bag-handle-outline' as const },
  { label: 'Entertainment', value: 'entertainment', icon: 'film-outline' as const },
  { label: 'Bills & Utilities', value: 'bills', icon: 'flash-outline' as const },
  { label: 'Health', value: 'health', icon: 'fitness-outline' as const },
  { label: 'Education', value: 'education', icon: 'book-outline' as const },
  { label: 'Salary', value: 'salary', icon: 'briefcase-outline' as const },
  { label: 'Freelance', value: 'freelance', icon: 'laptop-outline' as const },
  { label: 'Investment', value: 'investment', icon: 'trending-up-outline' as const },
  { label: 'Gift', value: 'gift', icon: 'gift-outline' as const },
  { label: 'Other', value: 'other', icon: 'ellipsis-horizontal-outline' as const },
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
  return CATEGORIES.find(c => c.value === value)?.icon || 'ellipsis-horizontal-outline';
}

export function formatRupee(val: number): string {
  const abs = Math.abs(val);
  const formatted = abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (val < 0 ? '-' : '') + '\u20B9' + formatted;
}

export function formatRupeeShort(val: number): string {
  if (val >= 100000) return '\u20B9' + (val / 100000).toFixed(1) + 'L';
  if (val >= 1000) return '\u20B9' + (val / 1000).toFixed(1) + 'k';
  return '\u20B9' + val.toFixed(0);
}
