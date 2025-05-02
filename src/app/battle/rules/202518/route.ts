import { NextResponse } from "next/server";

export function GET(req: Request) {
  return NextResponse.json({
    isoYearWeek: 202518,
    name: "Boom week",
    description: "Manifacturer is BOOM",
    predicate: { manufacturer: "BOOM" },
  });
}
