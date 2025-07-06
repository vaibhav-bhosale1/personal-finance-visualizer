// app/(dashboard)/page.tsx (updated for Stage 3)
"use client";

import { useState, useEffect, useCallback } from "react";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { MonthlyExpensesChart } from "@/components/monthly-expenses-chart";
import { CategoryPieChart } from "@/components/category-pie-chart";
import { SummaryCards } from "@/components/summary-cards";
import { BudgetManager } from "@/components/budget-manager";
import { BudgetVsActualChart } from "@/components/budget-vs-actual-chart";
import { ITransaction } from "@/models/Transaction";
import { ICategory } from "@/models/Category";
import { IBudget } from "@/models/Budget";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [budgets, setBudgets] = useState<(IBudget & { category: ICategory })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const [selectedMonthForBudgetChart, setSelectedMonthForBudgetChart] = useState(currentMonth);
  const [selectedYearForBudgetChart, setSelectedYearForBudgetChart] = useState(currentYear);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [transactionsRes, categoriesRes, budgetsRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/categories"),
        fetch(`/api/budgets?month=${selectedMonthForBudgetChart}&year=${selectedYearForBudgetChart}`), // Fetch budgets for current month/year by default
      ]);

      if (!transactionsRes.ok) throw new Error(`Error fetching transactions: ${transactionsRes.statusText}`);
      if (!categoriesRes.ok) throw new Error(`Error fetching categories: ${categoriesRes.statusText}`);
      if (!budgetsRes.ok) throw new Error(`Error fetching budgets: ${budgetsRes.statusText}`);

      const transactionsData: ITransaction[] = await transactionsRes.json();
      const categoriesData: ICategory[] = await categoriesRes.json();
      const budgetsData: (IBudget & { category: ICategory })[] = await budgetsRes.json();

      setTransactions(transactionsData);
      setCategories(categoriesData);
      setBudgets(budgetsData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data.");
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonthForBudgetChart, selectedYearForBudgetChart]); // Re-fetch when month/year changes

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTransaction = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error adding transaction: ${errorData.error || res.statusText}`);
      }
      await res.json();
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to add transaction.");
      console.error("Add error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTransaction = async (data: ITransaction) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/transactions/${data._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error updating transaction: ${errorData.error || res.statusText}`);
      }
      await res.json();
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to update transaction.");
      console.error("Edit error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error deleting transaction: ${errorData.error || res.statusText}`);
      }
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to delete transaction.");
      console.error("Delete error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBudget = async (data: { category: string; month: number; year: number; budgetAmount: number }) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error setting budget: ${errorData.error || res.statusText}`);
      }
      await res.json();
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to set budget.");
      console.error("Budget add error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error deleting budget: ${errorData.error || res.statusText}`);
      }
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to delete budget.");
      console.error("Budget delete error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple Spending Insights Logic
  const getSpendingInsights = () => {
    const currentMonthExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + t.amount, 0);

    const currentMonthBudgetedCategories = budgets
      .filter(b => b.month === currentMonth && b.year === currentYear)
      .map(b => b.category._id?.toString());

    const currentMonthActualExpensesByCategory: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear && t.category)
      .forEach(t => {
        const categoryId = t.category?.toString();
        if (categoryId) {
          currentMonthActualExpensesByCategory[categoryId] = (currentMonthActualExpensesByCategory[categoryId] || 0) + t.amount;
        }
      });

    const insights: string[] = [];

    if (budgets.length > 0) {
      let overBudgetCount = 0;
      let underBudgetCount = 0;

      budgets.forEach(budget => {
        if (budget.month === currentMonth && budget.year === currentYear) {
          const actualSpend = currentMonthActualExpensesByCategory[budget.category._id?.toString() || ''] || 0;
          if (actualSpend > budget.budgetAmount) {
            insights.push(`You are over budget for ${budget.category?.name} by ₹${(actualSpend - budget.budgetAmount).toFixed(2)}.`);
            overBudgetCount++;
          } else if (actualSpend < budget.budgetAmount) {
            insights.push(`You are under budget for ${budget.category?.name} by ₹${(budget.budgetAmount - actualSpend).toFixed(2)}.`);
            underBudgetCount++;
          } else {
            insights.push(`You are exactly on budget for ${budget.category?.name}.`);
          }
        }
      });

      if (overBudgetCount > 0) {
        insights.unshift(`You've gone over budget in ${overBudgetCount} categor${overBudgetCount > 1 ? 'ies' : 'y'} this month.`);
      }
      if (underBudgetCount > 0 && overBudgetCount === 0) {
        insights.unshift(`Great job! You're under budget in ${underBudgetCount} categor${underBudgetCount > 1 ? 'ies' : 'y'} this month.`);
      }
    } else {
      insights.push("Set some budgets to get personalized spending insights!");
    }

    if (currentMonthExpenses === 0) {
      insights.push("No expenses recorded for this month yet.");
    } else {
      insights.push(`Total expenses this month: ₹${currentMonthExpenses.toFixed(2)}`);
    }

    return insights;
  };

  const spendingInsights = getSpendingInsights();

  if (isLoading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Personal Finance Dashboard</h1>

      {error && <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-md">{error}</div>}

      <SummaryCards transactions={transactions} />

      <Card>
        <CardHeader>
          <CardTitle>Spending Insights for {format(new Date(currentYear, currentMonth), 'MMM yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {spendingInsights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </CardContent>
      </Card>


      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="space-y-8 mt-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Add New Transaction</h2>
            <TransactionForm
              onSubmit={handleAddTransaction}
              isLoading={isLoading}
              categories={categories}
            />
          </div>
          <TransactionList
            transactions={transactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        </TabsContent>
        <TabsContent value="charts" className="space-y-8 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MonthlyExpensesChart transactions={transactions} />
            <CategoryPieChart transactions={transactions} categories={categories} />
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Budget vs. Actual Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select
                  value={selectedMonthForBudgetChart.toString()}
                  onValueChange={(val) => setSelectedMonthForBudgetChart(parseInt(val))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedYearForBudgetChart.toString()}
                  onValueChange={(val) => setSelectedYearForBudgetChart(parseInt(val))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i)).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <BudgetVsActualChart
                transactions={transactions}
                budgets={budgets}
                selectedMonth={selectedMonthForBudgetChart}
                selectedYear={selectedYearForBudgetChart}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="budgets" className="mt-4">
          <BudgetManager
            categories={categories}
            budgets={budgets}
            onAddBudget={handleAddBudget}
            onDeleteBudget={handleDeleteBudget}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}