import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { withAuth } from "~/server/auth";
import { db } from "~/server/db";
import { userData } from "~/server/db/schema";

export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const jsonBody = (await req.json()) as {
      destination: string;
      destinationId: number;
      cost: number;
    };

    const [response] = await db
      .update(userData)
      .set({
        relocationAirport: jsonBody.destinationId,
        relocationEndTimestamp: Date.now() + 1000 * 60 * 60 * 0.5,
        relocationAirportId: jsonBody.destinationId,
        coins: sql`${userData.coins} - ${jsonBody.cost}`,
      })
      .where(eq(userData.userId, user.id))
      .returning({
        coins: userData.coins,
        numExposures: userData.numExposures,
        lastFilmHandoutTimeLeft: userData.lastFilmHandoutTimeLeft,
        unlimitedPhotosExpiryTime: userData.unlimitedPhotosExpiryTime,
        radarExpandTimeLeft: userData.radarExpandEndTimestamp,
      })
      .execute();

    return NextResponse.json({
      coins: response?.coins ?? "",
      photosUnlimited: response?.unlimitedPhotosExpiryTime ?? 0 > Date.now(),
      lastFilmHandoutTimeLeft: 1050,
      unlimitedPhotosTimeLeft: response?.unlimitedPhotosExpiryTime ?? 0,
      radarExpandTimeLeft:
        (Date.now() - (response?.radarExpandTimeLeft ?? 0)) / 1000,
      relocationTimeLeft: 60 * 60 * 0.5,
    });
  });
}
