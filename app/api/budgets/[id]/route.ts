// app/api/budgets/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Budget from '@/models/Budget';
import { Types } from 'mongoose';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  try {
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid Budget ID' }, { status: 400 });
    }
    const budget = await Budget.findById(id).populate('category');
    if (!budget) {
      return NextResponse.json({ success: false, message: 'Budget not found' }, { status: 404 });
    }
    return NextResponse.json(budget);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  try {
    const body = await request.json();
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid Budget ID' }, { status: 400 });
    }
    const budget = await Budget.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate('category');
    if (!budget) {
      return NextResponse.json({ success: false, message: 'Budget not found' }, { status: 404 });
    }
    return NextResponse.json(budget);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Budget for this category, month, and year already exists.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  try {
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid Budget ID' }, { status: 400 });
    }
    const deletedBudget = await Budget.deleteOne({ _id: id });
    if (deletedBudget.deletedCount === 0) {
      return NextResponse.json({ success: false, message: 'Budget not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Budget deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}