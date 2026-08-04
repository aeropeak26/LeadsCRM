import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Lead from '@/lib/models/Lead';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    await connectToDatabase();
    const doc = await Lead.findOneAndUpdate({ _id: id }, body, { new: true });
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await connectToDatabase();
    await Lead.findOneAndDelete({ _id: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}
