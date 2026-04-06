import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ presets: [], source: "placeholder" });
}

export async function POST() {
  return NextResponse.json({ message: "Preset create/update placeholder" }, { status: 200 });
}
