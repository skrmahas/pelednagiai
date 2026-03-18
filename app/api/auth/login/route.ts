import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, setAuthCookie } from "@/lib/auth";
import { ValidationError, readJsonBody, readRequiredString } from "@/lib/request";

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const password = readRequiredString(
      body,
      "password",
      "Slaptažodis privalomas"
    );

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: "Neteisingas slaptažodis" },
        { status: 401 }
      );
    }

    await setAuthCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Administratoriaus sesija nesukonfigūruota" },
      { status: 500 }
    );
  }
}
