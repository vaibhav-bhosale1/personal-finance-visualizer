// components/budget-manager.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ICategory } from "@/models/Category";
import { IBudget } from "@/models/Budget";

interface BudgetManagerProps {
  categories: ICategory[];
  budgets: (IBudget & { category: ICategory })[]; // Budgets with populated category
  onAddBudget: (data: { category: string; month: number; year: number; budgetAmount: number }) => Promise<void>;
  onDeleteBudget: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const budgetFormSchema = z.object({
  category: z.string().min(1, "Category is required."),
  month: z.coerce.number().min(0).max(11), // 0-11 for months
  year: z.coerce.number().min(2000).max(2100), // Adjust range as needed
  budgetAmount: z.coerce.number().positive("Budget amount must be positive."),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

export function BudgetManager({
  categories,
  budgets,
  onAddBudget,
  onDeleteBudget,
  isLoading,
}: BudgetManagerProps) {
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category: "",
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      budgetAmount: 0,
    },
  });

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' }),
  }));
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i); // Current year +/- 2

  const onSubmit = async (data: BudgetFormValues) => {
    await onAddBudget(data);
    form.reset({
      category: "",
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      budgetAmount: 0,
    });
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Set Monthly Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an expense category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {expenseCategories.map((category) => (
                          <SelectItem key={category._id?.toString()} value={category._id?.toString() || ""}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budgetAmount"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel>Budget Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 500.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-3">
                <Button type="submit" disabled={isLoading}>Set Budget</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <p className="text-muted-foreground">No budgets set yet.</p>
          ) : (
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month/Year
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {budgets.map((budget) => (
                    <tr key={budget._id?.toString()}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {budget.category?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {months[budget.month]?.label} {budget.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        ₹{budget.budgetAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDeleteBudget(budget._id?.toString() || '')}
                          disabled={isLoading}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}