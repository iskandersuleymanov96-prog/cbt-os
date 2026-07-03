import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY
  const configured = !!apiKey

  return NextResponse.json({
    configured,
    provider: configured ? "openrouter" : "none",
    model: configured ? "deepseek/deepseek-chat-v3-0324:free" : null,
  })
}
