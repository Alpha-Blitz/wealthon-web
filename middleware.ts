import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const devBypass = process.env.DEV_BYPASS_AUTH === 'true'

  if (!devBypass) {
    // Supabase sets an auth-token cookie on sign-in.
    // Presence check is enough for routing; JWT verification happens in server components.
    const hasSession = request.cookies.getAll().some(c => c.name.includes('-auth-token'))

    if (pathname.startsWith('/dashboard') && !hasSession) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (pathname === '/login' && hasSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
