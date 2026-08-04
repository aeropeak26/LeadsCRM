import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import SystemSettings from '@/lib/models/SystemSettings';

export async function GET() {
  try {
    await connectToDatabase();
    const data = await SystemSettings.findOne({ _id: 'settings' });
    return NextResponse.json(data || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    await connectToDatabase();
    const doc = await SystemSettings.findOneAndUpdate({ _id: 'settings' }, body, { new: true, upsert: true });
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}
