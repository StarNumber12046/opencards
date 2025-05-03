import { env } from "~/env";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
export async function hashPassword(password: string) {
  const b64salt = env.SALT;
  const salt = Buffer.from(b64salt, "base64");
  const hashed = await hash(password, salt.toString("utf8"));
  return hashed;
}

export async function verifyPassword(password: string, hashed: string) {
  const b64salt = env.SALT;
  const salt = Buffer.from(b64salt, "base64");
  const verified = await hash(password, salt.toString("utf8"));
  return verified === hashed;
}

export async function getUserDataByToken(token: string) {
  const user = await db.select().from(users).where(eq(users.token, token));
  return user[0];
}

export async function withAuth(
  req: Request,
  fn: (user: typeof users.$inferSelect) => Promise<NextResponse>,
) {
  try {
    const token = req.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }
    const user = await getUserDataByToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return fn(user);
  } catch {
    return NextResponse.json({ status: "error" }, { status: 401 });
  }
}
