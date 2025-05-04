// app/api/[...missing]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.warn(`❌ API 404 - ${req.method} ${req.nextUrl.pathname}`);
  return NextResponse.json({ error: "API route not found" }, { status: 404 });
}

export async function POST(req: NextRequest) {
  console.warn(`❌ API 404 - ${req.method} ${req.nextUrl.pathname}`);
  return NextResponse.json({ error: "API route not found" }, { status: 404 });
}

export async function PATCH(req: NextRequest) {
  console.warn(`❌ API 404 - ${req.method} ${req.nextUrl.pathname}`);
  return NextResponse.json({ error: "API route not found" }, { status: 404 });
}

// Add other HTTP methods if needed
