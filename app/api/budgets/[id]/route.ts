// app/api/budgets/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Budget from '@/models/Budget'; // Assuming Budget model exists
import { Types } from 'mongoose';
import { ZodError } from 'zod'; // Import ZodError if you're using Zod for validation

// Define a common interface for the route parameters
interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  await dbConnect();
  const { id } = params;

  try {
    // Validate ID format early
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid Budget ID format' }, { status: 400 });
    }

    const budget = await Budget.findById(id).populate('category'); // Populate category for richer data

    if (!budget) {
      return NextResponse.json({ success: false, message: 'Budget not found' }, { status: 404 });
    }

    return NextResponse.json(budget, { status: 200 }); // Explicitly set 200 status for success
  } catch (error: unknown) { // Use 'unknown' for better type safety
    // Log the error for debugging purposes
    console.error(`Error in GET /api/budgets/${id}:`, error);

    // Provide a more generic error message for the client
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  await dbConnect();
  const { id } = params;

  try {
    // Validate ID format
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid Budget ID format' }, { status: 400 });
    }

    const body = await request.json();

    // You might want to add Zod validation here for the request body
    // Example:
    // const parsedBody = yourBudgetSchema.parse(body);

    const budget = await Budget.findByIdAndUpdate(id, body, {
      new: true, // Return the updated document
      runValidators: true, // Run Mongoose schema validators
    }).populate('category'); // Populate category again if needed

    if (!budget) {
      return NextResponse.json({ success: false, message: 'Budget not found' }, { status: 404 });
    }

    return NextResponse.json(budget, { status: 200 }); // Explicitly set 200 status for success
  } catch (error: unknown) { // Use 'unknown'
    console.error(`Error in PUT /api/budgets/${id}:`, error);

    // Handle Mongoose validation errors specifically
    if (error instanceof Types.ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    // Handle duplicate key error (MongoDB error code 11000)
    // This assumes your Budget schema has a unique index that could cause this
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Budget for this category, month, and year already exists.' }, { status: 409 });
    }
    // If you're using Zod and have validation issues
    if (error instanceof ZodError) {
        return NextResponse.json({ success: false, error: error.issues }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  await dbConnect();
  const { id } = params;

  try {
    // Validate ID format
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid Budget ID format' }, { status: 400 });
    }

    // Using findByIdAndDelete is often safer/clearer than deleteOne for single document by _id
    const deletedBudget = await Budget.findByIdAndDelete(id);

    if (!deletedBudget) { // If document was not found and deleted
      return NextResponse.json({ success: false, message: 'Budget not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Budget deleted successfully' }, { status: 200 });
  } catch (error: unknown) { // Use 'unknown'
    console.error(`Error in DELETE /api/budgets/${id}:`, error);

    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}