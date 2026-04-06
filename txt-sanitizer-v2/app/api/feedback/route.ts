import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "feedback route ready" });
}

export async function POST() {
  return NextResponse.json({ message: "Feedback submission placeholder" }, { status: 202 });
}
