import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/lib/models/User';
import Lead from '@/lib/models/Lead';
import LeadNote from '@/lib/models/LeadNote';
import Followup from '@/lib/models/Followup';
import SystemSettings from '@/lib/models/SystemSettings';

export async function GET() {
  try {
    await connectToDatabase();
    
    const [users, leads, notes, followups, settings] = await Promise.all([
      User.find({}),
      Lead.find({}).sort({ createdAt: -1 }),
      LeadNote.find({}).sort({ createdAt: -1 }),
      Followup.find({}).sort({ scheduledAt: 1 }),
      SystemSettings.findOne({ _id: 'settings' }),
    ]);

    return NextResponse.json({
      users,
      leads,
      notes,
      followups,
      settings: settings || null,
    });
  } catch (error) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync data' }, { status: 500 });
  }
}
