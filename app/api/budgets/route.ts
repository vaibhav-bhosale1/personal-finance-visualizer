// app/api/budgets/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Budget from '@/models/Budget';
import { Types } from 'mongoose'; // Import Types for ObjectId

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let query: { [key: string]: any } = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const budgets = await Budget.find(query).populate('category');
    return NextResponse.json(budgets);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    // Ensure category is an ObjectId
    if (body.category && !Types.ObjectId.isValid(body.category)) {
      return NextResponse.json({ success: false, error: 'Invalid category ID' }, { status: 400 });
    }
    const budget = await Budget.create(body);
    // Populate after creation for consistent response if needed
    await budget.populate('category');
    return NextResponse.json(budget, { status: 201 });
  } catch (error: any) {
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Budget for this category, month, and year already exists.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}