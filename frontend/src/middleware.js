import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('token');
    const isAuthPage = request.nextUrl.pathname === '/';
    
    // Redirect to login if no token and trying to access protected routes
    if (!token && !isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Redirect to profile if already logged in and trying to access auth page
    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/profile', request.url));
    }

    return NextResponse.next();
}

// Configure which paths to run middleware on
export const config = {
    matcher: ['/', '/profile', '/gallery']
};
