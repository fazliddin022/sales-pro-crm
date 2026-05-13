import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { deals } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const [deal] = await db
    .update(deals)
    .set({
      title: body.title,
      value: body.value,
      stage: body.stage,
      priority: body.priority,
      notes: body.notes,
      updatedAt: new Date(),
    })
    .where(and(eq(deals.id, id), eq(deals.userId, session.user.id)))
    .returning();

  return NextResponse.json(deal);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await db
    .delete(deals)
    .where(and(eq(deals.id, id), eq(deals.userId, session.user.id)));

  return NextResponse.json({ success: true });
}