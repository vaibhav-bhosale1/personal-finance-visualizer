// app/(dashboard)/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { MonthlyExpensesChart } from "@/components/monthly-expenses-chart";
import { CategoryPieChart } from "@/components/category-pie-chart";
import { SummaryCards } from "@/components/summary-cards";
import { ITransaction } from "@/models/Transaction";
import { ICategory } from "@/models/Category";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactionsAndCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [transactionsRes, categoriesRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/categories"),
      ]);

      if (!transactionsRes.ok) {
        throw new Error(`Error fetching transactions: ${transactionsRes.statusText}`);
      }
      if (!categoriesRes.ok) {
        throw new Error(`Error fetching categories: ${categoriesRes.statusText}`);
      }

      const transactionsData: ITransaction[] = await transactionsRes.json();
      const categoriesData: ICategory[] = await categoriesRes.json();

      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data.");
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactionsAndCategories();
  }, [fetchTransactionsAndCategories]);

  const handleAddTransaction = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error(`Error adding transaction: ${res.statusText}`);
      }
      await res.json();
      fetchTransactionsAndCategories();
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
        throw new Error(`Error updating transaction: ${res.statusText}`);
      }
      await res.json();
      fetchTransactionsAndCategories();
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
        throw new Error(`Error deleting transaction: ${res.statusText}`);
      }
      fetchTransactionsAndCategories();
    } catch (err: any) {
      setError(err.message || "Failed to delete transaction.");
      console.error("Delete error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Personal Finance Dashboard</h1>

      {error && <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-md">{error}</div>}

      <SummaryCards transactions={transactions} />

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}