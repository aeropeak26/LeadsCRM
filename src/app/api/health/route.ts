import { NextResponse } from 'next/server';
import { connectToDatabase, isMongoDBConnected } from '@/lib/db/mongodb';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      return NextResponse.json({
        status: 'online',
        database: 'MongoDB Atlas',
        connected: isMongoDBConnected(),
        message: 'Successfully connected to MongoDB online database cluster!',
      });
    } else {
      return NextResponse.json({
        status: 'hybrid_local',
        database: 'Local Reactive Storage / In-Memory Store',
        connected: false,
        message: 'MONGODB_URI environment variable is not set. System running smoothly in local reactive mode.',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to connect to database' },
      { status: 500 }
    );
  }
}
