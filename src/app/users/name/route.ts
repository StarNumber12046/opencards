import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { withAuth } from "~/server/auth";
import { db } from "~/server/db";
import { userData } from "~/server/db/schema";
import { getDbUserDataById } from "~/server/queries/user";

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const jsonBody = (await req.json()) as { name: string };
    const currentUserData = await getDbUserDataById(user.id);
    if (!currentUserData) {
      return NextResponse.json({ error: "No user found" }, { status: 405 });
    }
    const usersWithSameName = await db
      .select()
      .from(userData)
      .where(eq(userData.name, jsonBody.name))
      .execute();
    if (usersWithSameName.length > 0 && usersWithSameName[0]!.id !== user.id) {
      return NextResponse.json(
        { error: "Name already taken" },
        { status: 400 },
      );
    }
    await db
      .update(userData)
      .set({
        name: jsonBody.name,
      })
      .where(eq(userData.userId, user.id))
      .execute();
    return NextResponse.json({});
  });
}
