import { NextResponse } from "next/server";
import { deliveryPayloadSchema } from "@/lib/deliveryValidation";
import { createDelivery, listDeliveries } from "@/services/delivery";

export async function GET() {
  const items = await listDeliveries();
  return NextResponse.json({ deliveries: items });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = deliveryPayloadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const created = await createDelivery(parsed.data);
  return NextResponse.json({ delivery: created }, { status: 201 });
}
