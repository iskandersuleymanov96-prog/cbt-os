import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  if (error) {
    const message = encodeURIComponent(errorDescription || "Ошибка авторизации")
    return NextResponse.redirect(`${origin}/auth?error=${message}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent("Код авторизации не получен")}`)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    const message = encodeURIComponent("Не удалось завершить авторизацию")
    return NextResponse.redirect(`${origin}/auth?error=${message}`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
