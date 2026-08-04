import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await connectToDatabase();
    const data = await User.find({});
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectToDatabase();
    if (!body._id && !body.id) body._id = `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    if (body.id && !body._id) body._id = body.id;
    if (!body.createdAt) body.createdAt = new Date().toISOString();
    
    const doc = await User.create(body);
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create data' }, { status: 500 });
  }
}
