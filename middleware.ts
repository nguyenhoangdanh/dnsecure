// In middleware.ts
import { NextResponse, NextRequest } from 'next/server'
import jwt, { JwtPayload } from 'jsonwebtoken';

// Define custom interface for JWT payload
interface CustomJwtPayload extends JwtPayload {
  sub: string;
  email?: string;
  sessionId?: string;
  roles?: string[];
}

// Define paths that don't require authentication
const publicPaths = ['/', '/login', '/register', '/verify-code', '/verify-email', '/forgot-password', '/reset-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // // Check if the path is public
  // if (publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
  //   return NextResponse.next()
  // }

  // // Get token from cookies
  // const cookieToken = request.cookies.get('accessToken')?.value;
  
  // // Try to get token from Authorization header as fallback
  // const authorization = request.headers.get('authorization');
  // const headerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  
  // // Determine which token to use
  // const token = cookieToken || headerToken;
  
  // console.log('Cookie token:', cookieToken);
  // console.log('Header token:', headerToken);
  // console.log('Using token:', token);

  // // If no token, redirect to login
  // if (!token) {
  //   console.log('No token found, redirecting to login');
  //   const url = new URL('/login', request.url)
  //   url.searchParams.set('callbackUrl', encodeURI(pathname))
  //   return NextResponse.redirect(url)
  // }

  // try {
  //   // Verify JWT token without calling API
  //   const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret';
  //   // Type assertion to help TypeScript understand the result
  //   const decoded = jwt.verify(token, jwtSecret) as CustomJwtPayload;
    
  //   console.log('Token verified successfully');
    
  //   // Add user info to headers
  //   const requestHeaders = new Headers(request.headers)
  //   if (decoded.sub) {
  //     requestHeaders.set('x-user-id', decoded.sub)
  //   }
  //   if (decoded.roles) {
  //     requestHeaders.set('x-user-roles', JSON.stringify(decoded.roles))
  //   }

  //   return NextResponse.next({
  //     request: {
  //       headers: requestHeaders,
  //     },
  //   });
  // } catch (error: any) {
  //   console.error('Token verification error:', error.name, error.message);
    
  //   // Try to refresh the token if it's expired
  //   if (error.name === 'TokenExpiredError') {
  //     try {
  //       console.log('Token expired, attempting refresh');
        
  //       // Use direct API call instead of redirect for token refresh
  //       const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';
  //       const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
  //         method: 'POST',
  //         credentials: 'include', // Important for cookies
  //         headers: {
  //           'Content-Type': 'application/json',
  //         }
  //       });
        
  //       // If refresh succeeded, redirect to same page to try again with new token
  //       if (refreshResponse.ok) {
  //         console.log('Token refreshed successfully');
  //         return NextResponse.redirect(request.url);
  //       }
        
  //       console.log('Token refresh failed', refreshResponse.status);
  //     } catch (refreshError) {
  //       console.error('Error during token refresh:', refreshError);
  //     }
  //   }
    
  //   // If we get here, authentication failed
  //   console.log('Authentication failed, redirecting to login');
  //   const url = new URL('/login', request.url)
  //   url.searchParams.set('callbackUrl', encodeURI(pathname))
  //   url.searchParams.set('tokenExpired', error.name === 'TokenExpiredError' ? 'true' : 'false')
  //   return NextResponse.redirect(url)
  // }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
}