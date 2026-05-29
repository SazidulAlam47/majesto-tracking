// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/tasks',
  '/add-task',
  '/users',
  '/update-password',
  '/download-report',
  '/profile',
];

// Routes that are admin-only
const adminOnlyRoutes = ['/add-task', '/users', '/update-password'];

// Routes that should be accessible without auth
const publicRoutes = ['/login', '/login-admin'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes to handle their own auth
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Allow public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for tokens in cookies (set by client-side code)
  const adminToken = request.cookies.get('admin_token')?.value;
  const userToken = request.cookies.get('user_token')?.value;
  const token = adminToken || userToken;

  // Public routes — redirect authenticated users to dashboard
  if (publicRoutes.some((route) => pathname === route)) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes — redirect unauthenticated users to login
  const isProtected =
    pathname === '/' ||
    protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Admin-only routes — for now let the page handle role checks
  // since we can't decode JWT in proxy without importing jsonwebtoken
  // (which requires Node.js APIs not available in edge proxy)

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
