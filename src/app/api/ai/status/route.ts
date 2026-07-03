import { NextResponse } from "next/server"

export async function GET() {
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY
  const hasOpenAI = !!process.env.OPENAI_API_KEY

  return NextResponse.json({
    configured: hasOpenRouter || hasOpenAI,
    provider: hasOpenRouter ? "openrouter" : hasOpenAI ? "openai" : "none",
    model: hasOpenRouter ? "deepseek/deepseek-chat" : "gpt-4o-mini",
  })
}
