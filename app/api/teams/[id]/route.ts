import { NextRequest, NextResponse } from "next/server";
import { getTeam, updateTeam } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import { ValidationError, readJsonBody, readRequiredString } from "@/lib/request";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) {
    return NextResponse.json({ error: "Komanda nerasta" }, { status: 404 });
  }
  return NextResponse.json(team);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Neautorizuota" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await readJsonBody(request);
    const name = readRequiredString(
      body,
      "name",
      "Komandos pavadinimas privalomas"
    );

    const team = await updateTeam(id, name);
    if (!team) {
      return NextResponse.json({ error: "Komanda nerasta" }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
