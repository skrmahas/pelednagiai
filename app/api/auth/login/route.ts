import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  if (!password) {
    return NextResponse.json(
      { error: "Slaptažodis privalomas" },
      { status: 400 }
    );
  }

  if (!verifyPassword(password)) {
    return NextResponse.json(
      { error: "Neteisingas slaptažodis" },
      { status: 401 }
    );
  }

  await setAuthCookie();
  return NextResponse.json({ success: true });
}
