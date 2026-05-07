import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { UserConfig } from '@/models/UserConfig';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await dbConnect();
    let config = await UserConfig.findOne({});
    if (!config) {
      config = await UserConfig.create({ alertEmail: '' });
    }
    return NextResponse.json({ success: true, email: config.alertEmail });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    await dbConnect();
    let config = await UserConfig.findOne({});
    if (!config) {
      config = new UserConfig();
    }
    config.alertEmail = email;
    await config.save();
    return NextResponse.json({ success: true, email: config.alertEmail });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
