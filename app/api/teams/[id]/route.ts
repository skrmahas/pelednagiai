import { NextRequest, NextResponse } from "next/server";
import { getTeam, updateTeam } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";

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
  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Komandos pavadinimas privalomas" },
      { status: 400 }
    );
  }

  const team = await updateTeam(id, name.trim());
  if (!team) {
    return NextResponse.json({ error: "Komanda nerasta" }, { status: 404 });
  }

  return NextResponse.json(team);
}
