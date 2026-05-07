import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Website } from '@/models/Website';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const deleted = await Website.findByIdAndDelete(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Website removed from monitoring' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete website' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    await dbConnect();
    const updated = await Website.findByIdAndUpdate(id, { $set: { isPaused: body.isPaused } }, { new: true });
    
    if (!updated) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, website: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update website' }, { status: 500 });
  }
}

