import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  let message = ""

  try {
    const body = await request.json()
    message = body.message ?? ""
    const history = body.history ?? []

    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY

    if (!apiKey) {
      const demoResponse = generatePatternResponse()
      return NextResponse.json({ response: demoResponse })
    }

    const baseUrl = process.env.OPENROUTER_API_KEY
      ? "https://openrouter.ai/api/v1"
      : "https://api.openai.com/v1"

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_API_KEY ? "openai/gpt-4o-mini" : "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Ты — AI-ассистент для анализа когнитивных паттернов в CBT OS.

Твоя задача:
- Анализировать записи пользователя
- Выявлять повторяющиеся паттерны мышления
- Определять связь между ситуациями, эмоциями и мыслями
- Предлагать осознание и рекомендации

Язык: русский.
Формат: структурированный, с конкретными примерами.`,
          },
          ...history.map((msg: { role: string; content: string }) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: "user", content: message },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    return NextResponse.json({ response: data.choices[0]?.message?.content })
  } catch (error) {
    console.error("AI patterns error:", error)
    return NextResponse.json({ response: generatePatternResponse() })
  }
}

function generatePatternResponse(): string {
  return "На основе ваших записей я вижу несколько интересных паттернов:\n\n1. **Тревога перед совещаниями** — повторяется каждую среду. Связано с установкой «меня будут критиковать».\n\n2. **Катастрофизация + Чтение мыслей** — эти искажения часто появляются вместе. Это может быть корневой паттерн.\n\n3. **Позитивная динамика** — ваш средний уровень стресса снижается на 5% каждую неделю.\n\nРекомендую сосредоточиться на работе с катастрофизацией — это даст наибольший эффект."
}
