
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    // Helper to get the correct origin
    const getRedirectOrigin = () => {
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'

        if (isLocalEnv) {
            return origin
        } else if (process.env.NEXT_PUBLIC_SITE_URL) {
            return process.env.NEXT_PUBLIC_SITE_URL
        } else if (forwardedHost) {
            return `https://${forwardedHost}`
        } else {
            return origin
        }
    }

    const redirectOrigin = getRedirectOrigin()

    if (code) {
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
                    },
                },
            }
        )
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${redirectOrigin}${next}`)
        } else {
            console.error('Auth code exchange error:', error)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${redirectOrigin}/login?error=auth_code_error`)
}
