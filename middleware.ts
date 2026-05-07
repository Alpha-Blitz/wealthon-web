import { type NextRequest, NextResponse } from "next/server"

// Stub — Phase 2 will add Supabase session checks.
// Protected routes: /dashboard/* and /admin/*
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
}
