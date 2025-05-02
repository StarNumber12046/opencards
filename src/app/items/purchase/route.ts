import { NextResponse } from "next/server";
export function POST(req: Request) {
  // TODO: Implement
  return NextResponse.json({
    coins: 166,
    addedItems: {
      CATCH_ANYWHERE: 0,
      CATCH_AGAIN: 0,
      CAMERA_STABILIZER: 1,
      TRAVEL_FREE: 0,
      TRAVEL_ANYWHERE: 0,
    },
  });
}
