import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { contacts } from "@/lib/schema";
import { eq } from "drizzle-orm";

// GET — barcha kontaktlar
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await db
    .select()
    .from(contacts)
    .where(eq(contacts.userId, session.user.id))
    .orderBy(contacts.createdAt);

  return NextResponse.json(data);
}

// POST — yangi kontakt
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const [contact] = await db
    .insert(contacts)
    .values({
      userId: session.user.id,
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      position: body.position,
      notes: body.notes,
    })
    .returning();

  return NextResponse.json(contact);
}