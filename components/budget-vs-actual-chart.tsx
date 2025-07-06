// components/budget-vs-actual-chart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ITransaction } from "@/models/Transaction";
import { IBudget } from "@/models/Budget";
import { ICategory } from "@/models/Category";
import { format } from "date-fns";

interface BudgetVsActualChartProps {
  transactions: ITransaction[];
  budgets: (IBudget & { category: ICategory })[];
  selectedMonth: number;
  selectedYear: number;
}

export function BudgetVsActualChart({
  transactions,
  budgets,
  selectedMonth,
  selectedYear,
}: BudgetVsActualChartProps) {
  const chartDataMap = new Map<string, { budget: number; actual: number; name: string }>();

  // Initialize with budgets for the selected month/year
  budgets
    .filter(
      (b) => b.month === selectedMonth && b.year === selectedYear && b.category
    )
    .forEach((budget) => {
      chartDataMap.set(budget.category._id?.toString() || '', {
        name: budget.category.name,
        budget: budget.budgetAmount,
        actual: 0, // Initialize actual to 0
      });
    });

  // Aggregate actual expenses for the selected month/year
  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);
    if (
      transaction.type === "expense" &&
      transaction.category &&
      transactionDate.getMonth() === selectedMonth &&
      transactionDate.getFullYear() === selectedYear
    ) {
      const categoryId = transaction.category.toString();
      const existingData = chartDataMap.get(categoryId);
      if (existingData) {
        chartDataMap.set(categoryId, {
          ...existingData,
          actual: existingData.actual + transaction.amount,
        });
      } else {
        // Handle uncategorized or categories without a set budget
        const categoryName = budgets.find(b => b.category._id?.toString() === categoryId)?.category?.name || "Uncategorized";
        chartDataMap.set(categoryId, {
          name: categoryName,
          budget: 0, // No budget set for this category
          actual: transaction.amount,
        });
      }
    }
  });

  const chartData = Array.from(chartDataMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  if (chartData.length === 0) {
    return <p className="text-center text-muted-foreground">No budget or actual expense data for {format(new Date(selectedYear, selectedMonth), 'MMM yyyy')}.</p>;
  }

  return (
    <div className="h-[350px] w-full">
      <h2 className="text-xl font-semibold mb-4">Budget vs. Actual (
        {format(new Date(selectedYear, selectedMonth), 'MMM yyyy')}
        )</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
          <Legend />
          <Bar dataKey="budget" fill="#8884d8" name="Budget" />
          <Bar dataKey="actual" fill="#82ca9d" name="Actual Spending" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}