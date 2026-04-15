import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './lib/auth';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute =
    path.startsWith('/student') ||
    path.startsWith('/teacher') ||
    path.startsWith('/admin');

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const session = await getSession();

  if (!session || !session.user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { role } = session.user;

  if (path.startsWith('/student') && role !== 'STUDENT') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (path.startsWith('/teacher') && role !== 'TEACHER') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (path.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};