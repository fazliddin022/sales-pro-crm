import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { activities } from "@/lib/schema";
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

  const [activity] = await db
    .update(activities)
    .set({
      type: body.type,
      title: body.title,
      description: body.description,
      completed: body.completed,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    })
    .where(and(eq(activities.id, id), eq(activities.userId, session.user.id)))
    .returning();

  return NextResponse.json(activity);
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
    .delete(activities)
    .where(and(eq(activities.id, id), eq(activities.userId, session.user.id)));

  return NextResponse.json({ success: true });
}