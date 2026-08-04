import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import LeadNote from '@/lib/models/LeadNote';

export async function GET() {
  try {
    await connectToDatabase();
    const data = await LeadNote.find({});
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectToDatabase();
    if (!body._id && !body.id) body._id = `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    if (body.id && !body._id) body._id = body.id;
    if (!body.createdAt) body.createdAt = new Date().toISOString();
    
    const doc = await LeadNote.create(body);
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create data' }, { status: 500 });
  }
}
