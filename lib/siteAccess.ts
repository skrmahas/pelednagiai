import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, verifySessionToken } from "@/lib/session";

const SITE_COOKIE = "site_access";
const SITE_SESSION_TTL = 60 * 60 * 24 * 30;

function getSitePassword(): string | undefined {
  return process.env.SITE_PASSWORD;
}

function getSiteSessionSecret(): string {
  const secret = process.env.SITE_SESSION_SECRET;
  if (!secret) {
    throw new Error("SITE_SESSION_SECRET is not set");
  }
  return secret;
}

export function verifySitePassword(password: string): boolean {
  const sitePassword = getSitePassword();
  if (!sitePassword) {
    return false;
  }
  return password === sitePassword;
}

export async function hasSiteAccess(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(
    cookieStore.get(SITE_COOKIE)?.value,
    "site",
    process.env.SITE_SESSION_SECRET
  );
}

export async function hasSiteAccessRequest(request: NextRequest): Promise<boolean> {
  return verifySessionToken(
    request.cookies.get(SITE_COOKIE)?.value,
    "site",
    process.env.SITE_SESSION_SECRET
  );
}

export async function setSiteAccessCookie(): Promise<void> {
  const cookieStore = await cookies();
  const token = await createSessionToken(
    "site",
    getSiteSessionSecret(),
    SITE_SESSION_TTL
  );

  cookieStore.set(SITE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SITE_SESSION_TTL,
    path: "/",
  });
}
