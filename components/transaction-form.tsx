// components/transaction-form.tsx
"use client";

import { useState } from "react";
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
import { cn } from "@/lib/utils"; // Make sure this utility is correct

const formSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive."),
  date: z.date({
    required_error: "A date is required.",
  }),
  description: z.string().min(1, "Description is required.").max(200, "Description is too long."),
  type: z.enum(["income", "expense"]), // Added type for consistency with model, will be used in Stage 2/3
});

type TransactionFormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  initialData?: TransactionFormValues & { _id?: string };
  onSubmit: (data: TransactionFormValues) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function TransactionForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: TransactionFormProps) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      amount: 0,
      date: new Date(),
      description: "",
      type: "expense", // Default to expense
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
        {/* Type field will be hidden for Stage 1, exposed in Stage 2/3 if needed */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <input type="hidden" {...field} />
          )}
        />
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