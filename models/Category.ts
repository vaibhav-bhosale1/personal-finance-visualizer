import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  type: 'income' | 'expense';
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ['income', 'expense'], default: 'expense' },
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);