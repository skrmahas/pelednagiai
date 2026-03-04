import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SITE_PASSWORD = 'bybys';
const SITE_COOKIE = 'site_access';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to the gate page and its API
  if (pathname === '/gate' || pathname === '/api/gate') {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for site access cookie
  const siteAccess = request.cookies.get(SITE_COOKIE);
  
  if (siteAccess?.value !== SITE_PASSWORD) {
    // Redirect to gate page
    return NextResponse.redirect(new URL('/gate', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
