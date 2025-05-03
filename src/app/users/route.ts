import { NextResponse } from "next/server";
import { hashPassword, withAuth } from "~/server/auth";
import { db } from "~/server/db";
import { userData, users } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import {
  getUserDataById,
  getCapturedRegs,
  getTotalXp,
} from "~/server/queries/user";

export async function POST(req: Request) {
  const jsonBody = (await req.json()) as { email: string; password: string };
  const hashed = await hashPassword(jsonBody.password);
  const user = await db
    .select()
    .from(users)
    .where(
      and(eq(users.email, jsonBody.email), eq(users.hashedPassword, hashed)),
    )
    .execute();
  if (!user[0]) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 },
    );
  }
  const currentUserData = await getUserDataById(user[0].id);
  if (!currentUserData) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      {
        status: 401,
      },
    );
  }
  console.log("CARDS", currentUserData.cards.length);
  const response = {
    token: user[0].token,
    userData: {
      ...currentUserData,
      xp: await getTotalXp(currentUserData),
      cards: currentUserData.cards.map((c) => ({
        ...c,
        captures: c.captures.map((cptr) => ({
          ...cptr,
        })),
        glowCount: c.glow ? 1 : 0,
      })),
      numAircraftModels: currentUserData.cards.length,
      unlockedModelIds: currentUserData.cards.map((c) => c.aircraftId),
      items: currentUserData.items.map((i) => {
        return { id: i.id, type: i.type };
      }),
    },
    relocation: { airportId: 0, airport: 0, timestamp: 0 },
    capturedRegs: await getCapturedRegs(currentUserData),
    missions: [],
  };

  console.log(response);
  return NextResponse.json(response, { status: 201 });
}

export async function PATCH(req: Request) {
  return withAuth(req, async (user) => {
    const jsonBody = (await req.json()) as { messagingToken: string };
    void (await db
      .update(userData)
      .set({ messagingToken: jsonBody.messagingToken })
      .where(eq(userData.userId, user.id))
      .execute());
    return NextResponse.json({
      messagingToken: jsonBody.messagingToken,
      lastFilmHandoutTimeLeft: 0,
      lastCapture: 0,
      radarExpandTimeLeft: 0,
      unlimitedPhotosTimeLeft: 0,
      relocation: {},
      relocationTimeLeft: 0,
      isVerified: false,
      hasPendingFriendRequests: false,
    });
  });
}

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const currentUserData = await getUserDataById(user.id);
    console.log("Current user data is ", currentUserData);
    if (!currentUserData) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        {
          status: 401,
        },
      );
    }
    const response = {
      token: user.token,
      userData: {
        ...currentUserData,
        xp: await getTotalXp(currentUserData),
        cards: currentUserData.cards.map((c) => ({
          ...c,
          captures: c.captures.map((cptr) => ({
            ...cptr,
          })),
          glowCount: c.glow ? 1 : 0,

          numAircraftModel: currentUserData.cards.length,
        })),
      },
      relocation: { airportId: 0, airport: 0, timestamp: 0 },
      capturedRegs: await getCapturedRegs(currentUserData),
      missions: [],
    };

    console.log(response);
    return NextResponse.json(response, { status: 200 });
  });
}
