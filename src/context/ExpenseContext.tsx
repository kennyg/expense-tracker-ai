'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  Expense,
  ExpenseFormData,
  ExpenseFilters,
  ExpenseSummary,
} from '@/types/expense';
import { generateId, calculateSummary } from '@/lib/utils';

const STORAGE_KEY = 'expense-tracker-data';

interface ExpenseContextType {
  expenses: Expense[];
  isLoading: boolean;
  filters: ExpenseFilters;
  summary: ExpenseSummary;
  filteredExpenses: Expense[];
  addExpense: (data: ExpenseFormData) => void;
  updateExpense: (id: string, data: ExpenseFormData) => void;
  deleteExpense: (id: string) => void;
  setFilters: (filters: Partial<ExpenseFilters>) => void;
  clearFilters: () => void;
  getExpenseById: (id: string) => Expense | undefined;
}

const defaultFilters: ExpenseFilters = {
  search: '',
  category: 'All',
  startDate: '',
  endDate: '',
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFiltersState] = useState<ExpenseFilters>(defaultFilters);

  // Load expenses from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setExpenses(parsed);
      }
    } catch (error) {
      console.error('Failed to load expenses from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      } catch (error) {
        console.error('Failed to save expenses to localStorage:', error);
      }
    }
  }, [expenses, isLoading]);

  const addExpense = useCallback((data: ExpenseFormData) => {
    const now = new Date().toISOString();
    const newExpense: Expense = {
      id: generateId(),
      amount: parseFloat(data.amount),
      category: data.category,
      description: data.description,
      date: data.date,
      createdAt: now,
      updatedAt: now,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  }, []);

  const updateExpense = useCallback((id: string, data: ExpenseFormData) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === id
          ? {
              ...expense,
              amount: parseFloat(data.amount),
              category: data.category,
              description: data.description,
              date: data.date,
              updatedAt: new Date().toISOString(),
            }
          : expense
      )
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  }, []);

  const setFilters = useCallback((newFilters: Partial<ExpenseFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  const getExpenseById = useCallback(
    (id: string) => {
      return expenses.find((expense) => expense.id === id);
    },
    [expenses]
  );

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          expense.description.toLowerCase().includes(searchLower) ||
          expense.category.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category !== 'All' && expense.category !== filters.category) {
        return false;
      }

      // Date range filter
      if (filters.startDate) {
        const expenseDate = new Date(expense.date);
        const startDate = new Date(filters.startDate);
        if (expenseDate < startDate) return false;
      }

      if (filters.endDate) {
        const expenseDate = new Date(expense.date);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (expenseDate > endDate) return false;
      }

      return true;
    });
  }, [expenses, filters]);

  const summary = useMemo(() => calculateSummary(expenses), [expenses]);

  const value: ExpenseContextType = {
    expenses,
    isLoading,
    filters,
    summary,
    filteredExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    setFilters,
    clearFilters,
    getExpenseById,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}
