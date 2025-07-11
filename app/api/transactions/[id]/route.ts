// app/api/transactions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import { Types, Error as MongooseError } from 'mongoose';
import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;

  try {
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid Transaction ID format' }, { status: 400 });
    }

    const transaction = await Transaction.findById(id).populate('category');

    if (!transaction) {
      return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json(transaction, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error in GET /api/transactions/${id}:`, error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;

  try {
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid Transaction ID format' }, { status: 400 });
    }

    const body = await request.json();

    const transaction = await Transaction.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate('category');

    if (!transaction) {
      return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json(transaction, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error in PUT /api/transactions/${id}:`, error);

    if (error instanceof MongooseError.ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 11000) {
      return NextResponse.json({
        success: false,
        error: 'Duplicate transaction detected.',
      }, { status: 409 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: error.issues }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;

  try {
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid Transaction ID format' }, { status: 400 });
    }

    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Transaction deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error in DELETE /api/transactions/${id}:`, error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}