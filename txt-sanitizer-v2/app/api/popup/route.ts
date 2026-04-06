import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ enabled: false, content: "", triggerType: "first_visit" });
}

export async function POST() {
  return NextResponse.json({ message: "Popup config placeholder" }, { status: 200 });
}
