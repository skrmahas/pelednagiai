import { cookies } from "next/headers";
import { createSessionToken, verifySessionToken } from "@/lib/session";

const ADMIN_COOKIE = "admin_session";
const ADMIN_SESSION_TTL = 60 * 60 * 24 * 7;

function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}

function getAdminSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return secret;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(
    cookieStore.get(ADMIN_COOKIE)?.value,
    "admin",
    process.env.ADMIN_SESSION_SECRET
  );
}

export function verifyPassword(password: string): boolean {
  const adminPassword = getAdminPassword();
  if (!adminPassword) {
    return false;
  }
  return password === adminPassword;
}

export async function setAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  const token = await createSessionToken(
    "admin",
    getAdminSessionSecret(),
    ADMIN_SESSION_TTL
  );

  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_SESSION_TTL,
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
