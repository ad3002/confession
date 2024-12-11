import { NextResponse } from 'next/server';

export function middleware(request) {
    // Изменим получение токена и добавим логирование
    const token = request.cookies.get('token')?.value;
    console.log('Middleware token:', token);
    
    const isAuthPage = request.nextUrl.pathname === '/';
    
    if (!token && !isAuthPage) {
        console.log('No token, redirecting to login');
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (token && isAuthPage) {
        console.log('Has token, redirecting to profile');
        return NextResponse.redirect(new URL('/profile', request.url));
    }

    return NextResponse.next();
}

// Configure which paths to run middleware on
export const config = {
    matcher: ['/', '/profile', '/gallery']
};
