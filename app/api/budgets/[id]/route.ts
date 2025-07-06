// app/api/budgets/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Budget from '@/models/Budget';
import mongoose, { Types, Error as MongooseError } from 'mongoose';
import { ZodError } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  try {
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid Budget ID format' }, { status: 400 });
    }

    const budget = await Budget.findById(id).populate('category');

    if (!budget) {
      return NextResponse.json({ success: false, message: 'Budget not found' }, { status: 404 });
    }

    return NextResponse.json(budget, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error in GET /api/budgets/${id}:`, error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  try {
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid Budget ID format' }, { status: 400 });
    }

    const body = await request.json();

    const budget = await Budget.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate('category');

    if (!budget) {
      return NextResponse.json({ success: false, message: 'Budget not found' }, { status: 404 });
    }

    return NextResponse.json(budget, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error in PUT /api/budgets/${id}:`, error);

    if (error instanceof MongooseError.ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 11000) {
      return NextResponse.json({
        success: false,
        error: 'Budget for this category, month, and year already exists.',
      }, { status: 409 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: error.issues }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  try {
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid Budget ID format' }, { status: 400 });
    }

    const deletedBudget = await Budget.findByIdAndDelete(id);

    if (!deletedBudget) {
      return NextResponse.json({ success: false, message: 'Budget not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Budget deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error in DELETE /api/budgets/${id}:`, error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}