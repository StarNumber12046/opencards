import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { withAuth } from "~/server/auth";
import { db } from "~/server/db";
import { userData } from "~/server/db/schema";
import { getTotalXp, getDbUserDataById } from "~/server/queries/user";

const possibleChoices = {
  photos_unlimited_1: { cost: 75, photos: 0, unlimitedTimeLeft: 0.5 * 60 * 60 },
  photos_unlimited_2: { cost: 150, photos: 0, unlimitedTimeLeft: 2 * 60 * 60 },
  photos_5: { cost: 10, photos: 0, unlimitedTimeLeft: 5 * 60 },
};

export function POST(req: Request) {
  return withAuth(req, async (user) => {
    const jsonBody = (await req.json()) as { productId: string };
    const currentUserData = await getDbUserDataById(user.id);
    if (!currentUserData) {
      return NextResponse.json({ error: "No user found" }, { status: 405 });
    }
    const purchasePackage =
      possibleChoices[
        jsonBody.productId as
          | "photos_unlimited_1"
          | "photos_unlimited_2"
          | "photos_5"
      ];
    if (!purchasePackage) {
      return NextResponse.json({ error: "No package found" }, { status: 400 });
    }
    await db
      .update(userData)
      .set({
        coins: currentUserData.coins - purchasePackage.cost,
        numExposures: currentUserData.numExposures + purchasePackage.photos,
        lastFilmHandoutTimeLeft: Date.now(),
        unlimitedPhotosTimeLeft: purchasePackage.unlimitedTimeLeft,
      })
      .where(eq(userData.userId, user.id))
      .execute();
    return NextResponse.json({
      coins: currentUserData.coins,
      photosUnlimited: purchasePackage.photos,
      lastFilmHandoutTimeLeft: 1050,
      unlimitedPhotosTimeLeft: purchasePackage.unlimitedTimeLeft,
      radarExpandTimeLeft: 0,
      relocationTimeLeft: 0,
    });
  });
}
