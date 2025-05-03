import { sign } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { hashPassword } from "~/server/auth";
import { db } from "~/server/db";
import { userData, users } from "~/server/db/schema";

export async function POST(req: Request) {
  const jsonBody = (await req.json()) as { password: string; email: string };
  console.log(jsonBody);
  const data = await db
    .insert(users)
    .values({
      token: sign({ email: jsonBody.email }, env.JWT_SECRET as string, {
        expiresIn: "1y",
      }),

      hashedPassword: await hashPassword(jsonBody.password),
      email: jsonBody.email,
    })
    .returning({
      id: users.id,
    })
    .execute();
  await db
    .insert(userData)
    .values({
      userId: data[0]!.id,
      name: "User",
      avatar: "0,0,0,0,0,0,0,0,0,12:#FAD5B5,#FAD5B5",
      xp: 0,
      numExposures: 5,
      lastFilmHandout: Date.now(),
      lastFilmHandoutTimeLeft: 0,
      coins: 0,
      lastCapture: Date.now(),
      battleOnboardingCompleted: false,
      usernameCompleted: false,
      radarExpandTimeLeft: 0,
      unlimitedPhotosTimeLeft: 0,
      relocationAirportId: 0,
      relocationAirport: 0,
      relocationTimestamp: 0,
      relocationTimeLeft: 0,
      isVerified: true,
      friendCode: "null",
      numAircraftModels: 0,
      numDestinations: 0,
      numBattleWins: 0,
      numAchievements: 0,
      hasPendingFriendRequests: false,
      messagingToken: null,
      email: jsonBody.email,
    })
    .execute();

  return NextResponse.json({
    error: "Not implemented",
  });
}
