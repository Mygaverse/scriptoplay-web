
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  let user = null;
  let error = null;
  try {
    const { data, error: authError } = await supabase.auth.getUser()
    user = data.user;
    error = authError;
  } catch (e: any) {
    console.error('[Middleware] Supabase getUser failed:', e.message);
    // Proceed as unauthenticated if fetch fails
  }

  const path = request.nextUrl.pathname;
  // console.log(`[Middleware] Path: ${path}, User: ${user?.email || 'None'}, Error: ${error?.message}`);

  const isProtectedRoute = path.startsWith('/dashboard') && !path.startsWith('/dashboard/migration');

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/authentication', request.url))
  }

  // Redirect /authentication to /dashboard if logged in
  if (path === '/authentication' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}
