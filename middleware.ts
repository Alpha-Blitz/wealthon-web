import { NextResponse, type NextRequest } from 'next/server'

if (process.env.NODE_ENV === 'production' && process.env.DEV_BYPASS_AUTH === 'true') {
  throw new Error('DEV_BYPASS_AUTH must not be set in production')
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const devBypass = process.env.DEV_BYPASS_AUTH === 'true'

  if (!devBypass) {
    const hasSession = request.cookies.getAll().some(
      c => c.name.includes('-auth-token') || c.name.includes('supabase.auth')
    )

    if (pathname.startsWith('/dashboard') && !hasSession) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Admin routes — redirect to login if no session
    // Actual admin_roles check happens in layout (server component)
    if (pathname.startsWith('/admin') && !hasSession) {
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
