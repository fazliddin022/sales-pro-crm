import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { activities } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await db
    .select()
    .from(activities)
    .where(eq(activities.userId, session.user.id))
    .orderBy(activities.createdAt);

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const [activity] = await db
    .insert(activities)
    .values({
      userId: session.user.id,
      type: body.type,
      title: body.title,
      description: body.description,
      completed: false,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    })
    .returning();

  return NextResponse.json(activity);
}