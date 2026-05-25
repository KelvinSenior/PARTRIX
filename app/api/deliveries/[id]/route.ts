import { NextResponse } from "next/server";
import { getDelivery, updateDelivery, updateStatus, addNote } from "@/services/delivery";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getDelivery(id);
  if (!d) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ delivery: d });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  if (body.status) {
    const updated = await updateStatus(id, body.status);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ delivery: updated });
  }

  if (body.note) {
    const updated = await addNote(id, body.note);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ delivery: updated });
  }

  const updated = await updateDelivery(id, body);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ delivery: updated });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // soft delete not implemented; just return success if exists
  const d = await getDelivery(id);
  if (!d) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  // remove by setting status
  await updateStatus(id, 'CANCELLED');
  return NextResponse.json({ success: true });
}
