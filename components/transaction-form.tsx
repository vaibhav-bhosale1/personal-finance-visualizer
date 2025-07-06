// components/transaction-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICategory } from "@/models/Category"; // Ensure this import is correct

// Define a constant for the "No Category" value to avoid magic strings
const NO_CATEGORY_VALUE = "none"; // You can choose any non-empty string here

// Define the Zod schema for transaction form validation
const formSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive."),
  date: z.date({
    required_error: "A date is required.",
  }),
  description: z.string().min(1, "Description is required.").max(200, "Description is too long."),
  type: z.enum(["income", "expense"], {
    required_error: "Transaction type is required.",
  }),
  // IMPORTANT: Handle the category field.
  // Transform NO_CATEGORY_VALUE to null, otherwise keep the value.
  category: z.string().optional().nullable().transform(e => e === NO_CATEGORY_VALUE ? null : e),
});

// Infer the TypeScript type from the Zod schema
type TransactionFormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  initialData?: TransactionFormValues & { _id?: string }; // initialData might include _id from DB
  onSubmit: (data: TransactionFormValues) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  categories: ICategory[]; // List of available categories
}

export function TransactionForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  categories,
}: TransactionFormProps) {
  // Initialize react-hook-form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      date: new Date(),
      description: "",
      type: "expense", // Default to expense
      // Convert ObjectId to string or use NO_CATEGORY_VALUE if null
      category: initialData?.category?.toString() || NO_CATEGORY_VALUE,
    },
  });

  // Effect to reset form when initialData changes (for editing transactions)
  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        date: new Date(initialData.date), // Ensure date is a Date object
        // Convert ObjectId to string or use NO_CATEGORY_VALUE if null
        category: initialData.category?.toString() || NO_CATEGORY_VALUE,
      });
    } else {
      // Reset to default for new transaction
      form.reset({
        amount: 0,
        date: new Date(),
        description: "",
        type: "expense",
        category: NO_CATEGORY_VALUE, // Default to NO_CATEGORY_VALUE for new transactions
      });
    }
  }, [initialData, form]);

  // Filter categories based on the selected transaction type
  const filteredCategories = categories.filter(c => c.type === form.watch('type'));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Amount Field */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 50.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Field */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Groceries from SuperMart" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type Field (Income/Expense) */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Field */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange} // The Zod transform handles converting 'none' to null
                value={field.value || NO_CATEGORY_VALUE} // Display NO_CATEGORY_VALUE for null field.value
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY_VALUE}>No Category</SelectItem> {/* Use the distinct value */}
                  {filteredCategories.map((category) => (
                    <SelectItem
                      key={category._id?.toString()}
                      value={category._id?.toString() || ""} // Standard category IDs will be strings
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {initialData ? "Save Changes" : "Add Transaction"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}