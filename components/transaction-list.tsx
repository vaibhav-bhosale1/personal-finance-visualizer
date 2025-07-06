// components/transaction-list.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TransactionForm } from "./transaction-form";
import { ITransaction } from "@/models/Transaction"; // Import the interface

interface TransactionListProps {
  transactions: ITransaction[];
  onEdit: (transaction: ITransaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null);

  const handleEditClick = (transaction: ITransaction) => {
    setEditingTransaction(transaction);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingTransaction) {
      await onEdit({ ...editingTransaction, ...data });
      setEditingTransaction(null);
    }
  };

  return (
    <div>
      {editingTransaction && (
        <div className="mb-8 p-4 border rounded-md">
          <h2 className="text-xl font-semibold mb-4">Edit Transaction</h2>
          <TransactionForm
            initialData={editingTransaction}
            onSubmit={handleFormSubmit}
            onCancel={() => setEditingTransaction(null)}
          />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions added yet.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{format(new Date(transaction.date), "PPP")}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-right">₹{transaction.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(transaction)} className="mr-2">
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            transaction.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(transaction._id as string)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}