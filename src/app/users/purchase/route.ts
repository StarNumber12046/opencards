import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { withAuth } from "~/server/auth";
import { db } from "~/server/db";
import { userData } from "~/server/db/schema";
import { getTotalXp, getDbUserDataById } from "~/server/queries/user";

const possibleChoices = {
  photos_unlimited_1: {
    cost: 75,
    photos: 0,
    unlimitedTimeLeft: 0.5 * 60 * 60,
    radarExpandTimeLeft: 0,
  },
  photos_unlimited_2: {
    cost: 150,
    photos: 0,
    unlimitedTimeLeft: 2 * 60 * 60,
    radarExpandTimeLeft: 0,
  },
  photos_5: {
    cost: 10,
    photos: 5,
    unlimitedTimeLeft: 0,
    radarExpandTimeLeft: 0,
  },
  radar_expand: {
    cost: 100,
    photos: 0,
    unlimitedTimeLeft: 0,
    radarExpandTimeLeft: 0.5 * 60 * 60,
  },
};

export function POST(req: Request) {
  return withAuth(req, async (user) => {
    const jsonBody = (await req.json()) as { productId: string };

    const purchasePackage =
      possibleChoices[
        jsonBody.productId as
          | "photos_unlimited_1"
          | "photos_unlimited_2"
          | "photos_5"
          | "radar_expand"
      ];
    if (!purchasePackage) {
      return NextResponse.json({ error: "No package found" }, { status: 400 });
    }
    if (purchasePackage.unlimitedTimeLeft > 0) {
      const [response] = await db
        .update(userData)
        .set({
          coins: sql`${userData.coins} - ${purchasePackage.cost}`,
          numExposures: sql`${userData.numExposures} + ${purchasePackage.photos}`,
          lastFilmHandoutTimeLeft: Date.now(),
          unlimitedPhotosExpiryTime:
            Date.now() + purchasePackage.unlimitedTimeLeft * 1000,
          radarExpandEndTimestamp:
            Date.now() + purchasePackage.radarExpandTimeLeft * 1000,
        })
        .where(eq(userData.userId, user.id))
        .returning({
          coins: userData.coins,
          numExposures: userData.numExposures,
          lastFilmHandoutTimeLeft: userData.lastFilmHandoutTimeLeft,
          unlimitedPhotosExpiryTime: userData.unlimitedPhotosExpiryTime,
          radarExpandEndTimestamp: userData.radarExpandEndTimestamp,
          relocationEndTimestamp: userData.relocationEndTimestamp,
        })
        .execute();
      return NextResponse.json({
        coins: response?.coins ?? "",
        photosUnlimited: purchasePackage.photos,
        lastFilmHandoutTimeLeft: 1050,
        unlimitedPhotosTimeLeft: purchasePackage.unlimitedTimeLeft,
        radarExpandTimeLeft:
          ((response?.radarExpandEndTimestamp ?? 0) - Date.now()) / 1000,
        relocationTimeLeft:
          ((response?.relocationEndTimestamp ?? 0) - Date.now()) / 1000,
      });
    } else {
      const [response] = await db
        .update(userData)
        .set({
          coins: sql`${userData.coins} - ${purchasePackage.cost}`,
          numExposures: sql`${userData.numExposures} + ${purchasePackage.photos}`,
          lastFilmHandoutTimeLeft: Date.now(),
          radarExpandEndTimestamp:
            Date.now() + purchasePackage.radarExpandTimeLeft * 1000,
        })
        .where(eq(userData.userId, user.id))
        .returning({
          coins: userData.coins,
          numExposures: userData.numExposures,
          lastFilmHandoutTimeLeft: userData.lastFilmHandoutTimeLeft,
          unlimitedPhotosExpiryTime: userData.unlimitedPhotosExpiryTime,
          radarExpandTimeLeft: userData.radarExpandEndTimestamp,
          relocationEndTimestamp: userData.relocationEndTimestamp,
        })
        .execute();
      return NextResponse.json({
        coins: response?.coins ?? "",
        photosUnlimited: purchasePackage.photos,
        lastFilmHandoutTimeLeft: 1050,
        unlimitedPhotosTimeLeft: purchasePackage.unlimitedTimeLeft,
        radarExpandTimeLeft:
          (response?.radarExpandTimeLeft ?? 0 - Date.now()) / 1000,
        relocationTimeLeft:
          ((response?.relocationEndTimestamp ?? 0) - Date.now()) / 1000,
      });
    }
  });
}
