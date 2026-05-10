import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NewUser } from "./schema";

export async function createUser(data: Omit<NewUser, "id" | "createdAt">) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const [user] = await db
    .insert(users)
    .values({ ...data, password: hashedPassword })
    .returning();

  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  return user;
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}