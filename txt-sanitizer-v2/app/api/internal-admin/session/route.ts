import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "tx_admin_session";
const DEFAULT_PASSCODE = "change-me";

export async function GET() {
  const jar = await cookies();
  const active = jar.get(COOKIE_NAME)?.value === "1";
  return NextResponse.json({ active });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as { passcode?: string };
  const passcode = payload.passcode?.trim();
  const expected = process.env.ADMIN_PASSCODE ?? DEFAULT_PASSCODE;

  if (!passcode || passcode !== expected) {
    return NextResponse.json({ success: false, message: "Invalid passcode." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: COOKIE_NAME,
    value: "1",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
