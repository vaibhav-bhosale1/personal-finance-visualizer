// models/Transaction.ts
import mongoose, { Schema, Document, Types } from 'mongoose'; // Import Types for ObjectId

export interface ITransaction extends Document {
  amount: number;
  date: Date;
  description: string;
  type: 'income' | 'expense';
  category?: Types.ObjectId; // Make category optional for now
}

const TransactionSchema: Schema = new Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  description: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], default: 'expense' },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: false }, // Updated
});

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);