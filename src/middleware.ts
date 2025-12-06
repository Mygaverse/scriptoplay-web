import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Define the path to protect
  const isDashboardPath = request.nextUrl.pathname.startsWith('/dashboard')

  // 2. Check for the cookie
  const hasSession = request.cookies.has('scriptoplay_session')

  // 3. Redirect logic
  if (isDashboardPath && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/authentication'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}