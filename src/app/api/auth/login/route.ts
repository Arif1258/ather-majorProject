import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

    await dbConnect();
    // Explicity select password since schema has it set to false natively
    const user = await User.findOne({ email }).select('+password');
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = signToken({ id: user._id.toString(), name: user.name, email: user.email });

    return NextResponse.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
