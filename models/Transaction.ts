import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  amount: number;
  date: Date;
  description: string;
  type: 'income' | 'expense'; // Added type for future flexibility, though not strictly required by Stage 1
}

const TransactionSchema: Schema = new Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  description: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], default: 'expense' },
});

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);