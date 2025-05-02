import { NextResponse } from "next/server";
export function GET(req: Request) {
  // TODO: Implement maybe
  return NextResponse.json({
    type: "MultiPoint",
    coordinates: [
      [19.41798, 50.37854],
      [20.26042, 51.94209],
      [19.79152, 52.85136],
      [20.70106, 50.8796],
      [19.42398, 50.37877],
    ],
  });
}
