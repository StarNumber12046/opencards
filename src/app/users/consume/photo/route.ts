import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { withAuth } from "~/server/auth";
import { db } from "~/server/db";
import { userData } from "~/server/db/schema";
import { getDbUserDataById } from "~/server/queries/user";
export function POST(req: Request) {
  return withAuth(req, async (user) => {
    const jsonBody = (await req.json()) as { amount: number };
    const currentUserData = await getDbUserDataById(user.id);
    const [returnData] = await db
      .update(userData)
      .set({
        numExposures: (currentUserData?.numExposures ?? 5) - jsonBody.amount,
      })
      .where(eq(userData.userId, user.id))
      .returning({
        id: userData.id,
        numExposures: userData.numExposures,
      })
      .execute();
    return NextResponse.json({
      numExposures: returnData?.numExposures ?? 5,
      unlimitedPhotosTimeLeft: 0,
      lastFilmHandoutTimeLeft: 1044,
      radarExpandTimeLeft: 0,
      relocationTimeLeft: 0,
    });
  });
}
