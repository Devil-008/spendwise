import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import * as Crypto from 'expo-crypto';
import { Expense, ExpenseType } from '@/lib/types';
import { loadExpenses, saveExpenses } from '@/lib/storage';

interface ExpenseContextValue {
  expenses: Expense[];
  isLoading: boolean;
  addExpense: (data: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  clearAll: () => void;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  reload: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const data = await loadExpenses();
    setExpenses(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addExpense = useCallback((data: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...data, id: Crypto.randomUUID() };
    setExpenses(prev => {
      const next = [newExpense, ...prev];
      saveExpenses(next);
      return next;
    });
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => {
      const next = prev.filter(e => e.id !== id);
      saveExpenses(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setExpenses([]);
    saveExpenses([]);
  }, []);

  const totalIncome = useMemo(() =>
    expenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0),
  [expenses]);

  const totalExpense = useMemo(() =>
    expenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0),
  [expenses]);

  const balance = totalIncome - totalExpense;

  const value = useMemo(() => ({
    expenses,
    isLoading,
    addExpense,
    deleteExpense,
    clearAll,
    totalIncome,
    totalExpense,
    balance,
    reload,
  }), [expenses, isLoading, addExpense, deleteExpense, clearAll, totalIncome, totalExpense, balance, reload]);

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider');
  return ctx;
}
