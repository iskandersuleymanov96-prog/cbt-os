import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials not configured. Running in demo mode.")
    return null as unknown as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}

export const supabase = createClient()
