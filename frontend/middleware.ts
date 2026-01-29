import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { session },
    } = await supabase.auth.getSession()

    // If user is NOT signed in and the current path is NOT /login or /signup
    // Also allow /auth/* for callbacks
    if (!session &&
        request.nextUrl.pathname !== '/login' &&
        request.nextUrl.pathname !== '/signup' &&
        request.nextUrl.pathname !== '/reset-password' &&
        request.nextUrl.pathname !== '/update-password' &&
        !request.nextUrl.pathname.startsWith('/auth')
    ) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If user IS signed in and the current path IS /login
    if (session && request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Admin route protection
    if (session && request.nextUrl.pathname.startsWith('/admin')) {
        // Fetch user profile to check admin status
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();

        if (!profile || !profile.is_admin) {
            // User is not an admin, redirect to dashboard
            const redirectUrl = new URL('/', request.url);
            redirectUrl.searchParams.set('error', 'admin_access_required');
            return NextResponse.redirect(redirectUrl);
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
