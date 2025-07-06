// components/category-pie-chart.tsx
"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ITransaction } from "@/models/Transaction";
import { ICategory } from "@/models/Category";

interface CategoryPieChartProps {
  transactions: ITransaction[];
  categories: ICategory[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF3333",
  "#33FFCC",
  "#FFCC33",
]; // More colors can be added

export function CategoryPieChart({ transactions, categories }: CategoryPieChartProps) {
  const categoryExpensesMap = new Map<string, number>();

  // Initialize map with 0 for all expense categories
  categories.filter(c => c.type === 'expense').forEach(cat => {
    categoryExpensesMap.set(cat._id?.toString() || '', 0);
  });

  transactions.forEach((transaction) => {
    if (transaction.type === "expense" && transaction.category) {
      const categoryId = transaction.category.toString();
      const currentAmount = categoryExpensesMap.get(categoryId) || 0;
      categoryExpensesMap.set(categoryId, currentAmount + transaction.amount);
    }
  });

  const chartData = Array.from(categoryExpensesMap.entries())
    .map(([categoryId, amount]) => {
      const categoryName = categories.find((c) => c._id?.toString() === categoryId)?.name || "Uncategorized";
      return {
        name: categoryName,
        value: amount,
      };
    })
    .filter(data => data.value > 0); // Only show categories with expenses

  if (chartData.length === 0) {
    return <p className="text-center text-muted-foreground">No category expense data to display.</p>;
  }

  return (
    <div className="h-[300px] w-full">
      <h2 className="text-xl font-semibold mb-4">Category Breakdown (Expenses)</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}