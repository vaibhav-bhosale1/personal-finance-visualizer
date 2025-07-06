// models/Category.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  type: 'income' | 'expense';
  user?: Types.ObjectId; // Optional, if you want user-specific categories
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false }, // Link to user if needed
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);