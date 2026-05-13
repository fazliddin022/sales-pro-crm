import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { contacts } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// PUT — kontaktni yangilash
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

  const [contact] = await db
    .update(contacts)
    .set({
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      position: body.position,
      notes: body.notes,
      updatedAt: new Date(),
    })
    .where(and(eq(contacts.id, id), eq(contacts.userId, session.user.id)))
    .returning();

  return NextResponse.json(contact);
}

// DELETE — kontaktni o'chirish
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
    .delete(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.userId, session.user.id)));

  return NextResponse.json({ success: true });
}