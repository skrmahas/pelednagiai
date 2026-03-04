import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const SITE_PASSWORD = "bybys";
const SITE_COOKIE = "site_access";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  if (!password) {
    return NextResponse.json(
      { error: "Slaptažodis privalomas" },
      { status: 400 }
    );
  }

  if (password !== SITE_PASSWORD) {
    return NextResponse.json(
      { error: "Neteisingas slaptažodis" },
      { status: 401 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(SITE_COOKIE, SITE_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return NextResponse.json({ success: true });
}
