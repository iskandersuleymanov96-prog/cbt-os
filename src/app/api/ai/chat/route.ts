import { NextRequest } from "next/server"

const SYSTEM_PROMPT = `Ты — AI-ассистент для рефлексии в приложении CBT OS (система когнитивно-поведенческой терапии).

Твоя роль:
- Помогать пользователю понимать свои мысли и эмоции
- Задавать рефлексивные вопросы
- Предлагать альтернативные перспективы
- Помогать выявлять когнитивные искажения
- Создавать еженедельные саммари и инсайты

Ты НЕ:
- Диагностируешь заболевания
- Назначаешь лечение
- Даёшь медицинские советы
- Заменяешь терапевта

Язык общения: русский.

Формат ответов: краткий, структурированный, с empathic tone.
Используй эмодзи умеренно для warmth.`

export async function POST(request: NextRequest) {
  const { message, history = [] } = await request.json()

  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    // Demo mode — stream mock response
    const demoResponse = generateDemoResponse(message)
    return streamText(demoResponse)
  }

  const baseUrl = process.env.OPENROUTER_API_KEY
    ? "https://openrouter.ai/api/v1"
    : "https://api.openai.com/v1"

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_API_KEY ? "openai/gpt-4o-mini" : "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history.map((msg: { role: string; content: string }) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: "user", content: message },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    // Transform SSE stream to text stream
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        let buffer = ""

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") {
                  controller.enqueue(encoder.encode("\n"))
                  controller.close()
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    controller.enqueue(encoder.encode(content))
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }
        } catch (err) {
          console.error("Stream error:", err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("AI chat error:", error)
    // Fallback to demo response
    const demoResponse = generateDemoResponse(message)
    return streamText(demoResponse)
  }
}

function streamText(text: string): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      // Simulate streaming by sending text word by word
      const words = text.split(" ")
      for (let i = 0; i < words.length; i++) {
        const word = (i > 0 ? " " : "") + words[i]
        controller.enqueue(encoder.encode(word))
        // Small delay for streaming effect in demo mode
        await new Promise((r) => setTimeout(r, 20))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  })
}

function generateDemoResponse(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes("настроение") || lower.includes("строение")) {
    return "Проанализировав ваши записи за неделю, я вижу следующее:\n\n• Среднее настроение: 3.8/5 (постепенный рост)\n• Пик тревожности — среда (совещание)\n• Самый спокойный день — пятница\n\nРекомендую: перед средой попробуйте технику глубокого дыхания. Это может снизить тревожность на 20-30%."
  }

  if (lower.includes("искажени") || lower.includes("паттерн")) {
    return "На основе ваших 15 записей, наиболее частые искажения:\n\n1. Катастрофизация (12 раз) — часто перед совещаниями\n2. Чтение мыслей (9 раз) — в ситуациях с руководством\n3. Долженствование (8 раз) — в рабочих задачах\n\nОбратите внимание: катастрофизация и чтение мыслей часто появляются вместе. Это может указывать на общую установку «меня будут оценивать негативно»."
  }

  if (lower.includes("альтернатив") || lower.includes("другой взгляд")) {
    return "Давайте поработаем с альтернативными мыслями. Расскажите мне о ситуации, которая вас беспокоит.\n\nПример:\nАвтоматическая мысль: «Если я опоздаю, меня уволят»\nАльтернатива: «Однократное опоздание — нормальная ситуация. Коллеги понимают. Я могу предупредить.»"
  }

  if (lower.includes("упражнен") || lower.includes("практика")) {
    return "Рекомендую начать с простых практик:\n\n1. **Заземление 5-4-3-2-1** (5 мин) — для снижения тревожности\n2. **Дыхание 4-7-8** (5 мин) — для расслабления\n3. **Вызов мыслей** (15 мин) — для работы с негативными мыслями\n\nКакое вас больше интересует?"
  }

  if (lower.includes("спасибо") || lower.includes("благодар")) {
    return "Рада помочь! Помните: каждый шаг к пониманию себя — это уже достижение. Продолжайте практиковаться, и вы заметите изменения. 💫"
  }

  return "Интересный вопрос! На основе ваших записей я вижу повторяющиеся паттерны. Расскажите больше о ситуации, которая вас беспокоит, и я помогу найти более сбалансированный взгляд. 🤔"
}
