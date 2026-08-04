const fs = require('fs');
const path = require('path');

const generateCrud = (entity, modelName) => {
  const dir = path.join(__dirname, 'src', 'app', 'api', entity);
  const idDir = path.join(dir, '[id]');
  fs.mkdirSync(idDir, { recursive: true });

  const routeContent = `import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import ${modelName} from '@/lib/models/${modelName}';

export async function GET() {
  try {
    await connectToDatabase();
    const data = await ${modelName}.find({});
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectToDatabase();
    const doc = await ${modelName}.create(body);
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create data' }, { status: 500 });
  }
}
`;

  const idRouteContent = `import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import ${modelName} from '@/lib/models/${modelName}';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    await connectToDatabase();
    const doc = await ${modelName}.findOneAndUpdate({ _id: id }, body, { new: true });
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await connectToDatabase();
    await ${modelName}.findOneAndDelete({ _id: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}
`;

  fs.writeFileSync(path.join(dir, 'route.ts'), routeContent);
  fs.writeFileSync(path.join(idDir, 'route.ts'), idRouteContent);
};

// Generate for all collections
generateCrud('users', 'User');
generateCrud('leads', 'Lead');
generateCrud('notes', 'LeadNote');
generateCrud('followups', 'Followup');

// Settings only needs a root route since it's a singleton
const settingsDir = path.join(__dirname, 'src', 'app', 'api', 'settings');
fs.mkdirSync(settingsDir, { recursive: true });
fs.writeFileSync(path.join(settingsDir, 'route.ts'), `import { NextResponse } from 'next/server';
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
`);

console.log('API routes generated.');
