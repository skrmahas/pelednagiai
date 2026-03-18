import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasSiteAccessRequest } from "@/lib/siteAccess";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/gate" || pathname === "/api/gate") {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const siteAccess = await hasSiteAccessRequest(request);
  if (!siteAccess) {
    return NextResponse.redirect(new URL("/gate", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
