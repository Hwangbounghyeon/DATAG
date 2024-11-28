import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/signup', '/'];

export async function middleware(request: NextRequest) {
  const refreshTokenCookie = request.cookies.get('refreshToken');
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);
  const res = NextResponse.next();

  if (path === '/') {
    return NextResponse.next();
  }

  if (refreshTokenCookie) {
    // refresh token exists
    if (isPublicRoute) {
      // public route
      return NextResponse.redirect(new URL('/project', request.url));
    } else return res;
  } else {
    // refresh token does not exist
    if (isPublicRoute) {
      return res;
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
}
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
