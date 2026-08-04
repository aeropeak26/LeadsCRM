import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/lib/models/User';
import Lead from '@/lib/models/Lead';
import Followup from '@/lib/models/Followup';
import LeadNote from '@/lib/models/LeadNote';
import SystemSettings from '@/lib/models/SystemSettings';
import { INITIAL_USERS, INITIAL_LEADS, INITIAL_FOLLOWUPS, INITIAL_NOTES, DEFAULT_SETTINGS } from '@/lib/storage/mockData';

export async function GET() {
  try {
    await connectToDatabase();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Lead.deleteMany({}),
      Followup.deleteMany({}),
      LeadNote.deleteMany({}),
      SystemSettings.deleteMany({}),
    ]);

    // Insert new mock data
    await User.insertMany(INITIAL_USERS.map(u => ({ ...u, _id: u.id })));
    await Lead.insertMany(INITIAL_LEADS.map(l => ({ ...l, _id: l.id })));
    await Followup.insertMany(INITIAL_FOLLOWUPS.map(f => ({ ...f, _id: f.id })));
    await LeadNote.insertMany(INITIAL_NOTES.map(n => ({ ...n, _id: n.id })));
    await SystemSettings.create({ ...DEFAULT_SETTINGS, _id: 'settings' });

    const totalUsersInDb = await User.countDocuments();
    const totalLeadsInDb = await Lead.countDocuments();

    return NextResponse.json({
      status: 'success',
      message: 'MongoDB Atlas Online Database seeded successfully!',
      usersCount: totalUsersInDb,
      leadsCount: totalLeadsInDb,
    });
  } catch (error: any) {
    console.error('Seeding failed:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Seeding failed' },
      { status: 500 }
    );
  }
}
