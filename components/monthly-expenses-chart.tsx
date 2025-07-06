// components/monthly-expenses-chart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ITransaction } from "@/models/Transaction"; // Assuming ITransaction is accessible

interface MonthlyExpensesChartProps {
  transactions: ITransaction[];
}

export function MonthlyExpensesChart({ transactions }: MonthlyExpensesChartProps) {
  // Aggregate data for monthly expenses
  const monthlyDataMap = new Map<string, number>();

  transactions.forEach((transaction) => {
    if (transaction.type === 'expense') { // Only count expenses
      const date = new Date(transaction.date);
      const monthYear = format(date, "MMM yyyy"); // e.g., "Jan 2023"
      const currentAmount = monthlyDataMap.get(monthYear) || 0;
      monthlyDataMap.set(monthYear, currentAmount + transaction.amount);
    }
  });

  // Convert map to array of objects for Recharts
  const chartData = Array.from(monthlyDataMap.entries())
    .map(([monthYear, amount]) => ({
      name: monthYear,
      expenses: amount,
    }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime()); // Sort by date

  if (chartData.length === 0) {
    return <p className="text-center text-muted-foreground">No expense data to display for the chart.</p>;
  }

  return (
    <div className="h-[300px] w-full">
      <h2 className="text-xl font-semibold mb-4">Monthly Expenses</h2>
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
          <Bar dataKey="expenses" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import { format } from "date-fns"; // Make sure to import format