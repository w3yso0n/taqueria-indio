import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    // Protect /negocio routes
    if (pathname.startsWith('/negocio')) {
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Redirect to /negocio if already logged in and trying to access /login
    if (pathname === '/login') {
        if (token) {
            return NextResponse.redirect(new URL('/negocio', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/negocio/:path*', '/login'],
};
