import { NextRequest, NextResponse } from "next/server";
import { ValidationError, readJsonBody, readRequiredString } from "@/lib/request";
import { setSiteAccessCookie, verifySitePassword } from "@/lib/siteAccess";

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    const password = readRequiredString(
      body,
      "password",
      "Slaptažodis privalomas"
    );

    if (!verifySitePassword(password)) {
      return NextResponse.json(
        { error: "Neteisingas slaptažodis" },
        { status: 401 }
      );
    }

    await setSiteAccessCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Svetainės prieiga nesukonfigūruota" },
      { status: 500 }
    );
  }
}
