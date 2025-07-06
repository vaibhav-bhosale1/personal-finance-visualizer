// components/summary-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ITransaction } from "@/models/Transaction";
import { format } from "date-fns";

interface SummaryCardsProps {
  transactions: ITransaction[];
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5); // Get up to 5 most recent

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          {/* Icon */}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">All time expenses</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          {/* Icon */}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalIncome.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">All time income</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
          {/* Icon */}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{netSavings.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Income minus expenses</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-3 lg:col-span-3">
        <CardHeader>
          <CardTitle>Most Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-muted-foreground">No recent transactions.</p>
          ) : (
            <ul className="space-y-2">
              {recentTransactions.map((t) => (
                <li key={t._id?.toString()} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(t.date), "MMM dd, yyyy")}</p>
                  </div>
                  <span className={t.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                    {t.type === 'expense' ? '-' : '+'} ₹{t.amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}