import { NextResponse } from "next/server";
import { withAuth } from "~/server/auth";
import { getTotalXp, getUserDataById } from "~/server/queries/user";
export function GET(req: Request) {
  return withAuth(req, async (user) => {
    const userData = await getUserDataById(user.id);
    if (!userData) {
      return NextResponse.json({ error: "No user found" }, { status: 405 });
    }
    const response = {
      xp: await getTotalXp(userData),
      coins: userData.coins,
      numExposures: userData.numExposures,
      lastFilmHandoutTimeLeft: 1050,
      unlimitedPhotosTimeLeft: 0,
      radarExpandTimeLeft: 0,
      relocationTimeLeft: 0,
    };
    console.log(response);
    return NextResponse.json(response);
  });
}
