import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { withAuth } from "~/server/auth";
import { db } from "~/server/db";
import { userData, items } from "~/server/db/schema";
import { getUserDataById } from "~/server/queries/user";
export function DELETE(
  req: Request,
  { params }: { params: Promise<{ item: string }> },
) {
  return withAuth(req, async (user) => {
    const item = (await params).item;
    const currentUserData = await getUserDataById(user.id);
    if (!currentUserData) {
      return NextResponse.json({ error: "No user found" }, { status: 405 });
    }
    const userCoins = currentUserData.coins;
    await db
      .update(userData)
      .set({
        coins: userCoins,
      })
      .where(eq(userData.id, currentUserData.id))
      .execute();
    console.log({ [item]: 1 });
    await db.delete(items).where(eq(items.type, item)).limit(1).execute();
    return NextResponse.json({
      success: true,
    });
  });
}
