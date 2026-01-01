import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // 1. Define protected routes
  const isProtectedRoute = path.startsWith('/dashboard');
  
  // 2. Check for the session cookie (We set this in LoginForm/SignupForm)
  // This is a "fast check" before Firebase loads
  const session = request.cookies.get('scriptoplay_session');

  // 3. If accessing dashboard without cookie -> Redirect to Auth
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/authentication', request.url));
  }

  return NextResponse.next();
}

// Configure paths
export const config = {
  matcher: ['/dashboard/:path*', '/authentication'],
};