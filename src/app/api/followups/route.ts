import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Followup from '@/lib/models/Followup';

export async function GET() {
  try {
    await connectToDatabase();
    const data = await Followup.find({});
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectToDatabase();
    const doc = await Followup.create(body);
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create data' }, { status: 500 });
  }
}
