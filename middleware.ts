import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Create Supabase client for middleware
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Get the session from cookies
  const cookieHeader = req.headers.get('cookie') || ''
  let session = null

  try {
    // Extract session from cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    // Check for Supabase session cookie
    if (cookies['sb-access-token'] || cookies['sb-refresh-token']) {
      const { data: { session: sessionData } } = await supabase.auth.getSession()
      session = sessionData
    }
  } catch (error) {
    console.error('Error getting session in middleware:', error)
  }

  // Protected routes
  const protectedRoutes = ['/post', '/dashboard']
  const adminRoutes = ['/admin']

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  const isAdminRoute = adminRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Redirect to auth if accessing protected routes without session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // For admin routes, we need to check the user's role
  if (isAdminRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth', req.url))
    }

    try {
      // Get user profile to check role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (error || profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    } catch (error) {
      console.error('Error checking admin role:', error)
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/post/:path*', '/dashboard/:path*', '/admin/:path*'],
} 