import { NextResponse } from "next/server";
import { withAuth } from "~/server/auth";
import { captures, userData } from "~/server/db/schema";
import type { CapturePayload } from "~/types/captures";
import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { cards } from "~/server/db/schema";
import {
  getCardStats,
  getTier,
  getTotalXp,
  getDbUserDataById,
} from "~/server/queries/user";
export async function POST(req: Request) {
  return withAuth(req, async (user) => {
    const jsonBody = (await req.json()) as CapturePayload;
    console.log(jsonBody);
    const currentUserData = await getDbUserDataById(user.id);
    if (!currentUserData) {
      return NextResponse.json({ error: "No user found" }, { status: 405 });
    }
    let card = await db
      .select()
      .from(cards)
      .where(
        and(
          eq(cards.userId, currentUserData.id),
          eq(cards.aircraftId, jsonBody.model),
        ),
      )
      .execute();
    console.log("CARD!!!!", card);
    if (!card[0]) {
      card = await db
        .insert(cards)
        .values({
          userId: currentUserData.id,
          aircraftId: jsonBody.model,
        })
        .returning({
          id: cards.id,
          userId: cards.userId,
          aircraftId: cards.aircraftId,
        })
        .execute();
      console.log(card);
    }
    if (!card[0]) {
      return NextResponse.json({ error: "No card found" }, { status: 400 });
    }
    const captureInsert: typeof captures.$inferInsert = {
      alt: jsonBody.alt,
      callsign: jsonBody.callsign,
      cloudiness: jsonBody.cloudiness,
      destination: jsonBody.associatedAirportId.toString(),
      destinationId: jsonBody.associatedAirportId,
      associatedAirportId: jsonBody.associatedAirportId,
      flight: jsonBody.flightId.toString(),
      flightId: jsonBody.flightId,
      gpsLat: jsonBody.gpsLat,
      gpsLon: jsonBody.gpsLon,
      glow: jsonBody.glow,
      icon: jsonBody.icon,
      lat: jsonBody.lat,
      lon: jsonBody.lon,
      onGround: jsonBody.onGround,
      origin: null,
      originId: null,
      radarLat: jsonBody.radarLat,
      radarLon: jsonBody.radarLon,
      radarRange: jsonBody.radarRange,
      reg: jsonBody.reg,
      source: jsonBody.source,
      speed: jsonBody.speed,
      status: jsonBody.status,
      timestamp: jsonBody.timestamp,
      track: jsonBody.track,
      xp: jsonBody.xp,
      cardId: card[0].id,
      coverage: jsonBody.coverage,
      distance: jsonBody.distance,
      model: jsonBody.model,
      xpUserBonus: jsonBody.xpUserBonus,
      imageCopy: jsonBody.imageCopy,
      imageLarge: jsonBody.imageLarge,
      imageThumb: jsonBody.imageThumb,
    };
    console.log(captureInsert);
    const capture = await db
      .insert(captures)
      .values(captureInsert)
      .returning({
        id: captures.id,
        cardId: captures.cardId,
        lat: captures.lat,
        lon: captures.lon,
        alt: captures.alt,
        speed: captures.speed,
        destination: captures.destination,
        destinationId: captures.destinationId,
        origin: captures.origin,
        originId: captures.originId,
        flight: captures.flight,
        reg: captures.reg,
        callsign: captures.callsign,
        gpsLat: captures.gpsLat,
        gpsLon: captures.gpsLon,
        distance: captures.distance,
        radarLat: captures.radarLat,
        radarLon: captures.radarLon,
        radarRange: captures.radarRange,
        associatedAirportId: captures.associatedAirportId,
        flightId: captures.flightId,
        track: captures.track,
        icon: captures.icon,
        status: captures.status,
        timestamp: captures.timestamp,
        onGround: captures.onGround,
        source: captures.source,
        model: captures.model,
        xpUserBonus: captures.xpUserBonus,
        coverage: captures.coverage,
        cloudiness: captures.cloudiness,
        imageLarge: captures.imageLarge,
        imageThumb: captures.imageThumb,
        imageCopy: captures.imageCopy,
        glow: captures.glow,
      })
      .execute();
    if (!capture[0]) {
      return NextResponse.json({ error: "No capture found" }, { status: 400 });
    }
    const allCaptures = await db
      .select()
      .from(captures)
      .where(eq(captures.cardId, card[0].id))
      .execute();
    await db
      .update(userData)
      .set({
        coins:
          Number(jsonBody.coverage == 100) +
          Number(jsonBody.cloudiness == 100) +
          currentUserData.coins,
      })
      .where(eq(userData.userId, user.id))
      .execute();
    const { cloudiness, coverage, glow, xp } = getCardStats(allCaptures);
    const response = {
      card: {
        id: card[0].id,
        modelId: card[0].aircraftId,
        aircraftId: card[0].aircraftId,
        coverage,
        cloudiness,
        xp,
        glow,
        tier: getTier(allCaptures),
        glowCount: allCaptures.filter((c) => c.glow).length,
      },
      capture: {
        id: capture[0].id,
        userId: card[0].userId,
        cardId: capture[0].cardId,
        lat: capture[0].lat,
        lon: capture[0].lon,
        alt: capture[0].alt,
        speed: capture[0].speed,
        destination: capture[0].destination,
        destinationId: capture[0].destinationId,
        origin: capture[0].origin,
        originId: capture[0].originId,
        flight: capture[0].flight,
        reg: capture[0].reg,
        callsign: capture[0].callsign,
        gpsLat: capture[0].gpsLat,
        gpsLon: capture[0].gpsLon,
        distance: capture[0].distance,
        radarLat: capture[0].radarLat,
        radarLon: capture[0].radarLon,
        radarRange: capture[0].radarRange,
        associatedAirportId: capture[0].associatedAirportId,
        flightId: capture[0].flightId,
        track: capture[0].track,
        icon: capture[0].icon,
        status: capture[0].status,
        timestamp: capture[0].timestamp,
        onGround: capture[0].onGround,
        source: capture[0].source,
        model: capture[0].model,
        xpUserBonus: capture[0].xpUserBonus,
        coverage: capture[0].coverage,
        cloudiness: capture[0].cloudiness,
        imageLarge: capture[0].imageLarge,
        imageThumb: capture[0].imageThumb,
        imageCopy: capture[0].imageCopy,
        glow: capture[0].glow,
      },
      coins: jsonBody.coins + currentUserData.coins, // currentUserData has not been updated with the new coins so we sum
      userXp: await getTotalXp(currentUserData),
      achievements: [
        { id: "RARE100", progressNumerator: 8, isAchieved: false },
      ],
      missions: [
        {
          type: "daily",
          data: [
            {
              key: "TokyoSingapore",
              title: "Catch a flight going from Tokyo to Singapore or back",
              award: 10,
              type: "daily",
              timestamp: 1746057600000,
              claimed: false,
              percentage: 0,
              length: 1,
            },
            {
              key: "LondonParis",
              title: "Catch a flight going from London to Paris or back",
              award: 10,
              type: "daily",
              timestamp: 1746057600000,
              claimed: false,
              percentage: 0,
              length: 1,
            },
            {
              key: "catchR44",
              title: "Catch an aircraft of type ROBINSON R-44",
              award: 8,
              type: "daily",
              timestamp: 1746057600000,
              claimed: false,
              percentage: 0,
              length: 1,
            },
          ],
          unclaimed: 0,
          unfinished: 3,
        },
      ],
    };
    console.log(JSON.stringify(response));
    return NextResponse.json(response, { status: 201 });
  });
}
