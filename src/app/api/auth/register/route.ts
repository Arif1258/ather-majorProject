import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: 'All fields required' }, { status: 400 });

    await dbConnect();
    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = signToken({ id: user._id.toString(), name: user.name, email: user.email });

    return NextResponse.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
