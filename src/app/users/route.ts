import { NextResponse } from "next/server";
import { hashPassword, withAuth } from "~/server/auth";
import { db } from "~/server/db";
import { userData, users } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import {
  getFullUserDataById,
  getCapturedRegs,
  getTotalXp,
} from "~/server/queries/user";
import type { UserData } from "~/types/user";

// Common response formatter for both POST and GET routes
function formatUserResponse(
  currentUserData: UserData,
  user: {
    token: string;
    hashedPassword: string;
    email: string;
    id: string;
  },
  capturedRegs: string[],
) {
  return {
    token: user.token,
    userData: {
      ...currentUserData,
      xp: currentUserData.xp,
      cards: currentUserData.cards.map((c) => ({
        ...c,
        captures: c.captures.map((cptr) => ({ ...cptr })),
        glowCount: c.glow ? 1 : 0,
      })),
      numAircraftModels: currentUserData.cards.length,
      unlockedModelIds: currentUserData.cards.map((c) => c.aircraftId),
      items: currentUserData.items.map((i) => ({
        id: i.id,
        type: i.type,
      })),
    },
    relocation: { airportId: 0, airport: 0, timestamp: 0 },
    capturedRegs,
    missions: [],
  };
}

// Handles user authentication and returns appropriate error response
async function authenticateUser(email: string, hashedPassword: string) {
  const user = await db
    .select()
    .from(users)
    .where(
      and(eq(users.email, email), eq(users.hashedPassword, hashedPassword)),
    )
    .execute();

  if (!user[0]) {
    return { error: "Invalid username or password", status: 401 };
  }

  const currentUserData = await getFullUserDataById(user[0].id);
  if (!currentUserData) {
    return { error: "Invalid username or password", status: 401 };
  }

  // Pre-calculate total XP to avoid duplicate calculations
  const totalXp = await getTotalXp(currentUserData);
  currentUserData.xp = totalXp;

  // Fetch captured registrations once
  const capturedRegs = await getCapturedRegs(currentUserData);

  return { user: user[0], currentUserData, capturedRegs, status: 201 };
}

export async function POST(req: Request) {
  const jsonBody = (await req.json()) as { email: string; password: string };
  const hashed = await hashPassword(jsonBody.password);

  const authResult = await authenticateUser(jsonBody.email, hashed);

  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const response = formatUserResponse(
    authResult.currentUserData!,
    authResult.user!,
    authResult.capturedRegs!,
  );

  return NextResponse.json(response, { status: authResult.status });
}

export async function PATCH(req: Request) {
  return withAuth(req, async (user) => {
    const jsonBody = (await req.json()) as { messagingToken: string };

    const returnValues = await db
      .update(userData)
      .set({ messagingToken: jsonBody.messagingToken })
      .where(eq(userData.userId, user.id))
      .returning({
        unlimitedPhotosExpiryTime: userData.unlimitedPhotosExpiryTime,
      })
      .execute();

    return NextResponse.json({
      messagingToken: jsonBody.messagingToken,
      lastFilmHandoutTimeLeft: 0,
      lastCapture: 0,
      radarExpandTimeLeft: 0,
      unlimitedPhotosTimeLeft:
        returnValues[0]!.unlimitedPhotosExpiryTime - Date.now(),
      relocation: {},
      relocationTimeLeft: 0,
      isVerified: false,
      hasPendingFriendRequests: false,
    });
  });
}

export async function GET(req: Request) {
  return withAuth(req, async (user) => {
    const currentUserData = await getFullUserDataById(user.id);

    if (!currentUserData) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    // Pre-calculate values used in response
    const totalXp = await getTotalXp(currentUserData);
    currentUserData.xp = totalXp;
    const capturedRegs = await getCapturedRegs(currentUserData);

    const response = formatUserResponse(currentUserData, user, capturedRegs);

    return NextResponse.json(response, { status: 200 });
  });
}
