import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define paths that don't require authentication
const publicPaths = ['/', '/login', '/register', '/verify-code', '/verify-email', '/forgot-password', '/reset-password']

// Define paths that require specific roles
const roleProtectedPaths: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/admin/users': ['ADMIN'],
  '/admin/roles': ['ADMIN'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the path is public
  if (publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next()
  }

  // Get the session token from cookies
  const sessionToken = request.cookies.get('session_token')?.value

  // If no session token, redirect to login
  if (!sessionToken) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  try {
    // Verify session token (in a real implementation, you would validate against your database)
    const response = await fetch(`${request.nextUrl.origin}/api/auth/verify-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: sessionToken }),
    })

    const data = await response.json()

    // If session is invalid, redirect to login
    if (!response.ok || !data.valid) {
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', encodeURI(pathname))
      return NextResponse.redirect(url)
    }

    // Check role-based access for protected paths
    for (const [protectedPath, requiredRoles] of Object.entries(roleProtectedPaths)) {
      if (pathname.startsWith(protectedPath)) {
        const hasRequiredRole = requiredRoles.some(role => data.roles.includes(role))
        
        if (!hasRequiredRole) {
          return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
      }
    }

    // Add user info to headers for the application to use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', data.userId)
    requestHeaders.set('x-user-roles', JSON.stringify(data.roles))

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('Auth middleware error:', error)
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', encodeURI(pathname))
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that handle their own authentication
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
}
