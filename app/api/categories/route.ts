// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

export async function GET(request: Request) {
  await dbConnect();
  try {
    const categories = await Category.find({});
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const category = await Category.create(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}