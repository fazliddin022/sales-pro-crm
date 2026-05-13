import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { deals } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await db
    .select()
    .from(deals)
    .where(eq(deals.userId, session.user.id))
    .orderBy(deals.createdAt);

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const [deal] = await db
    .insert(deals)
    .values({
      userId: session.user.id,
      title: body.title,
      value: body.value || 0,
      stage: body.stage || "lead",
      priority: body.priority || "medium",
      notes: body.notes,
    })
    .returning();

  return NextResponse.json(deal);
}