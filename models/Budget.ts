import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBudget extends Document {
  category: Types.ObjectId;
  month: number; // 0-11 for Jan-Dec
  year: number;
  budgetAmount: number;
}
const BudgetSchema: Schema = new Schema({
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  month: { type: Number, required: true, min: 0, max: 11 }, // 0-11 for Jan-Dec
  year: { type: Number, required: true },
  budgetAmount: { type: Number, required: true },
}, {
  timestamps: true,
});

export default mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);