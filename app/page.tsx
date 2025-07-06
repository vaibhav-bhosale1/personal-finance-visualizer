// app/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { MonthlyExpensesChart } from "@/components/monthly-expenses-chart";
import { ITransaction } from "@/models/Transaction"; // Import the interface

export default function HomePage() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/transactions");
      if (!res.ok) {
        throw new Error(`Error fetching transactions: ${res.statusText}`);
      }
      const data: ITransaction[] = await res.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch transactions.");
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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
      fetchTransactions(); // Re-fetch all transactions to update the list and chart
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
      fetchTransactions();
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
      fetchTransactions();
    } catch (err: any) {
      setError(err.message || "Failed to delete transaction.");
      console.error("Delete error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Personal Finance Visualizer</h1>

      {error && <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Transaction</h2>
          <TransactionForm onSubmit={handleAddTransaction} isLoading={isLoading} />
        </div>
        <div>
          <MonthlyExpensesChart transactions={transactions} />
        </div>
      </div>

      <TransactionList
        transactions={transactions}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
}