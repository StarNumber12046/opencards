import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
export function GET(_req: Request) {
  return redirect("/app/deck");
}
