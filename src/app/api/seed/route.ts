import { NextResponse } from 'next';
import { connectToDatabase } from '@/lib/db/mongodb';
import User from '@/models/User';
import Lead from '@/models/Lead';
import Followup from '@/models/Followup';
import LeadNote from '@/models/LeadNote';
import { INITIAL_USERS, INITIAL_LEADS, INITIAL_FOLLOWUPS, INITIAL_NOTES } from '@/lib/storage/mockData';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        status: 'hybrid_local',
        message: 'Running in Local Storage Mode. Add MONGODB_URI in .env.local to persist directly into MongoDB cloud database.',
      });
    }

    // Seed Users
    for (const u of INITIAL_USERS) {
      await User.updateOne(
        { email: u.email },
        {
          $set: {
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            status: u.status,
          },
        },
        { upsert: true }
      );
    }

    // Fetch created/upserted admin & dev users
    const adminDoc = await User.findOne({ email: 'info@aeropeak.tech' });
    const devDoc = await User.findOne({ email: 'devatharshini@gmail.com' });

    // Seed Sample Leads into MongoDB
    for (const l of INITIAL_LEADS) {
      const assignedId = l.assignedUserId === 'u-dev-1' ? devDoc?._id : (l.assignedUserId === 'u-admin-1' ? adminDoc?._id : null);
      await Lead.updateOne(
        { phone: l.phone },
        {
          $set: {
            name: l.name,
            phone: l.phone,
            email: l.email,
            company: l.company,
            city: l.city,
            state: l.state,
            address: l.address,
            remarks: l.remarks,
            assignedUserId: assignedId,
            status: l.status,
            followupDate: l.followupDate ? new Date(l.followupDate) : null,
          },
        },
        { upsert: true }
      );
    }

    const totalUsersInDb = await User.countDocuments();
    const totalLeadsInDb = await Lead.countDocuments();

    return NextResponse.json({
      status: 'success',
      message: 'MongoDB Atlas Online Database seeded successfully!',
      usersCount: totalUsersInDb,
      leadsCount: totalLeadsInDb,
      adminEmail: 'info@aeropeak.tech',
      userEmail: 'devatharshini@gmail.com',
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Seeding failed' },
      { status: 500 }
    );
  }
}
