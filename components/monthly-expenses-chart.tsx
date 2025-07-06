// components/monthly-expenses-chart.tsx
"use client";

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid, // Added for grid lines
} from 'recharts';
import { ITransaction } from "@/models/Transaction"; // Ensure this path is correct
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming you have shadcn/ui Card

interface MonthlyExpensesChartProps {
  transactions: ITransaction[];
}

export function MonthlyExpensesChart({ transactions }: MonthlyExpensesChartProps) {
  // Aggregate data for the chart
  const aggregateMonthlyData = () => {
    const monthlyData: { [key: string]: number } = {};

    transactions.forEach(transaction => {
      // Only include expenses for this chart
      if (transaction.type === 'expense') {
        const date = new Date(transaction.date);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        monthlyData[monthYear] = (monthlyData[monthYear] || 0) + transaction.amount;
      }
    });

    // Convert to array of objects and sort by date for consistent chart display
    // You might want a more robust sorting if you have data across many years
    const sortedData = Object.keys(monthlyData)
      .map(key => ({
        name: key,
        expenses: monthlyData[key],
      }))
      .sort((a, b) => {
        // Simple sorting, you might need a more sophisticated date parser for robust sorting
        const [monthA, yearA] = a.name.split(' ');
        const [monthB, yearB] = b.name.split(' ');
        const dateA = new Date(monthA + ' 1, ' + yearA);
        const dateB = new Date(monthB + ' 1, ' + yearB);
        return dateA.getTime() - dateB.getTime();
      });

    return sortedData;
  };

  const data = aggregateMonthlyData();

  return (
    <Card className="h-full"> {/* Ensure card takes full height */}
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" /> {/* Add grid lines */}
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} /> {/* Y-axis label */}
              <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} /> {/* Format tooltip value */}
              <Legend /> {/* Add a legend */}
              <Bar dataKey="expenses" fill="#8884d8" name="Total Expenses" /> {/* Bar for expenses */}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No expense data available for the chart.
          </div>
        )}
      </CardContent>
    </Card>
  );
}