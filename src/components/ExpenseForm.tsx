'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExpenseFormData,
  ExpenseCategory,
  EXPENSE_CATEGORIES,
  CATEGORY_ICONS,
  Expense,
} from '@/types/expense';
import { useExpenses } from '@/context/ExpenseContext';
import { getToday, cn } from '@/lib/utils';

interface ExpenseFormProps {
  editExpense?: Expense;
  onSuccess?: () => void;
}

interface FormErrors {
  amount?: string;
  description?: string;
  date?: string;
  category?: string;
}

export default function ExpenseForm({ editExpense, onSuccess }: ExpenseFormProps) {
  const router = useRouter();
  const { addExpense, updateExpense } = useExpenses();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: editExpense?.amount.toString() || '',
    category: editExpense?.category || 'Food',
    description: editExpense?.description || '',
    date: editExpense?.date || getToday(),
  });

  useEffect(() => {
    if (editExpense) {
      setFormData({
        amount: editExpense.amount.toString(),
        category: editExpense.category,
        description: editExpense.description,
        date: editExpense.date,
      });
    }
  }, [editExpense]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.amount) > 1000000) {
      newErrors.amount = 'Amount seems too large';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    } else if (formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Simulate a small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (editExpense) {
        updateExpense(editExpense.id, formData);
      } else {
        addExpense(formData);
        // Reset form after adding
        setFormData({
          amount: '',
          category: 'Food',
          description: '',
          date: getToday(),
        });
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      if (onSuccess) {
        onSuccess();
      } else if (editExpense) {
        router.push('/expenses');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCategorySelect = (category: ExpenseCategory) => {
    setFormData((prev) => ({ ...prev, category }));
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {editExpense ? 'Expense updated successfully!' : 'Expense added successfully!'}
        </div>
      )}

      {/* Amount Field */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="0.00"
            className={cn(
              'w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors',
              errors.amount
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            )}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
        )}
      </div>

      {/* Category Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {EXPENSE_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategorySelect(category)}
              className={cn(
                'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all',
                formData.category === category
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <span className="text-2xl mb-1">{CATEGORY_ICONS[category]}</span>
              <span className="text-xs font-medium">{category}</span>
            </button>
          ))}
        </div>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="What was this expense for?"
          className={cn(
            'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none',
            errors.description
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          )}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="text-sm text-red-600">{errors.description}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-400">
            {formData.description.length}/200
          </span>
        </div>
      </div>

      {/* Date Field */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          max={getToday()}
          className={cn(
            'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors',
            errors.date
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          )}
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        {editExpense && (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all',
            isSubmitting
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:bg-blue-700 active:scale-[0.98]'
          )}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {editExpense ? 'Updating...' : 'Adding...'}
            </span>
          ) : editExpense ? (
            'Update Expense'
          ) : (
            'Add Expense'
          )}
        </button>
      </div>
    </form>
  );
}
