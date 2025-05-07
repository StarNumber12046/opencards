import { NextResponse } from "next/server";

export function GET(req: Request) {
  return NextResponse.json({
    isoYearWeek: 202519,
    name: "Everything week",
    description: "Whatever",
    predicate: {},
  });
}
