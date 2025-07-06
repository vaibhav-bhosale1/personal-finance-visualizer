// app/page.tsx (or app/(dashboard)/dashboard/page.tsx)
"use client";

import { useState, useEffect, useCallback } from "react";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { MonthlyExpensesChart } from "@/components/monthly-expenses-chart";
import { ITransaction } from "@/models/Transaction";
import { ICategory } from "@/models/Category";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/loader"; // Import the Loader component

export default function HomePage() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Initial state set to true as data is loading
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const fetchTransactions = useCallback(async () => {
    // setIsLoading(true); // Moved to useEffect or a combined fetch function if desired
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
      console.error("Fetch transactions error:", err);
    }
    // finally { setIsLoading(false); } // Handled in combined fetchInitialData
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) {
        throw new Error(`Error fetching categories: ${res.statusText}`);
      }
      const data: ICategory[] = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch categories.");
      console.error("Fetch categories error:", err);
    }
  }, []);

  // Combined function to fetch all initial data
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchTransactions(),
      fetchCategories()
    ]);
    setIsLoading(false);
  }, [fetchTransactions, fetchCategories]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);


  const handleAddTransaction = async (data: any) => {
    setIsLoading(true); // Start loader for action
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
      await fetchInitialData(); // Re-fetch all data to update everything
    } catch (err: any) {
      setError(err.message || "Failed to add transaction.");
      console.error("Add error:", err);
    } finally {
      setIsLoading(false); // Stop loader
    }
  };

  const handleEditTransaction = async (data: ITransaction) => {
    setIsLoading(true); // Start loader for action
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
      await fetchInitialData(); // Re-fetch all data
    } catch (err: any) {
      setError(err.message || "Failed to update transaction.");
      console.error("Edit error:", err);
    } finally {
      setIsLoading(false); // Stop loader
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setIsLoading(true); // Start loader for action
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error deleting transaction: ${errorData.error || res.statusText}`);
      }
      await fetchInitialData(); // Re-fetch all data
    } catch (err: any) {
      setError(err.message || "Failed to delete transaction.");
      console.error("Delete error:", err);
    } finally {
      setIsLoading(false); // Stop loader
    }
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" /> {/* Display a large loader while initial data loads */}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold text-center">Personal Finance Visualizer</h1>
      <p className="text-center text-gray-600">
        Track your expenses and visualize your monthly spending.
      </p>
     
      {error && <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Transaction</h2>
          {/* We now pass isLoading to TransactionForm so its buttons can be disabled */}
          <TransactionForm onSubmit={handleAddTransaction} isLoading={isLoading} categories={categories} />
        </div>
        <div>
          <MonthlyExpensesChart transactions={transactions} />
        </div>
      </div>

      <TransactionList
        transactions={transactions}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        // You might want to pass isLoading to TransactionList too for row actions
      />
    </div>
  );
}