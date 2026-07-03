import { NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `Ты — AI-ассистент для рефлексии в приложении CBT OS (система когнитивно-поведенческой терапии).

Твоя роль — помогать пользователю в работе с мыслями и эмоциями:

1. Переосмысление негативных мыслей: помогай пользователю взглянуть на ситуацию под другим углом. Задавай вопросы типа «Что бы вы посоветовали другу в такой ситуации?» или «Какие доказательства за и против этой мысли?».

2. Сократические вопросы: не давай готовых ответов, а направляй через вопросы, чтобы пользователь сам пришёл к инсайту. Например: «Это факт или интерпретация?», «Что самое худшее, лучшее и наиболее вероятное может произойти?».

3. Выявление когнитивных искажений: помогай распознавать типичные искажения — катастрофизация, чёрно-белое мышление, чтение мыслей, долженствование, персонализация, эмоциональное рассуждение, сверхобобщение, ментальный фильтр.

4. Генерация альтернативных мыслей: помогай формулировать более сбалансированные, реалистичные и конструктивные альтернативы автоматическим негативным мыслям.

5. Помощь с ведением дневника: направляй структурированное ведение записей — ситуация, эмоция, автоматическая мысль, когнитивное искажение, альтернативная мысль, новая эмоция.

ВАЖНЫЕ ПРАВИЛА:
- Ты НЕ являешься врачом, психотерапевтом или медицинским специалистом.
- НЕ ставь диагнозы, НЕ назначай лечение, НЕ давай медицинские советы.
- Если пользователь спрашивает о медицинской помощи — покажи дисклеймер: «Я не являюсь медицинским специалистом. Если вам нужна помощь, обратитесь к квалифицированному специалисту по психическому здоровью.»
- Заменять терапевта — НЕ входит в твои возможности.

Формат ответов: краткий, структурированный, с эмпатическим тоном.
Используй эмодзи умеренно для warmth.
Язык общения: русский.`

const MODELS = [
  "deepseek/deepseek-chat-v3-0324:free",
  "deepseek/deepseek-chat:free",
  "meta-llama/llama-3.1-8b-instruct:free",
]

const BASE_URL = "https://openrouter.ai/api/v1"

function getErrorMessage(status: number): string {
  switch (status) {
    case 401:
      return "Ошибка аутентификации: проверьте ваш OPENROUTER_API_KEY в файле .env.local."
    case 429:
      return "Превышен лимит запросов. Пожалуйста, подождите минуту и попробуйте снова."
    case 503:
      return "Сервис временно недоступен. Попробуйте позже."
    default:
      return `Ошибка сервера (${status}). Попробуйте позже.`
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    return new Response(
      "Ключ API не настроен. Добавьте OPENROUTER_API_KEY в файл .env.local:\n\nOPENROUTER_API_KEY=sk-or-v1-ваш_ключ\n\nПолучить ключ можно на https://openrouter.ai/keys",
      {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Error-Type": "api-key-missing",
        },
      }
    )
  }

  const { message, history = [] } = await request.json()

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Сообщение не может быть пустым." }, { status: 400 })
  }

  let lastError: string | null = null

  for (const model of MODELS) {
    try {
      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://cbt-os.local",
          "X-Title": "CBT OS",
        },
        body: JSON.stringify({
          model,
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
        const errText = await response.text().catch(() => "")
        lastError = getErrorMessage(response.status)
        console.error(`Model ${model} failed (${response.status}):`, errText)
        continue
      }

      const encoder = new TextEncoder()
      const decoder = new TextDecoder()

      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader()
          if (!reader) {
            controller.enqueue(encoder.encode("Извините, не удалось получить ответ. Попробуйте ещё раз."))
            controller.close()
            return
          }

          let buffer = ""
          let hasContent = false

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
                  if (data === "[DONE]") break

                  try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices?.[0]?.delta?.content
                    if (content) {
                      hasContent = true
                      controller.enqueue(encoder.encode(content))
                    }
                  } catch {
                    // Skip malformed JSON
                  }
                }
              }
            }
          } catch (err) {
            console.error("Stream read error:", err)
          } finally {
            if (!hasContent) {
              controller.enqueue(
                encoder.encode("Извините, ответ пуст. Попробуйте переформулировать вопрос.")
              )
            }
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`Model ${model} network error:`, msg)
      lastError = `Ошибка сети: ${msg}. Проверьте подключение к интернету.`
      continue
    }
  }

  return new Response(
    lastError || "Не удалось получить ответ от AI. Попробуйте позже.",
    {
      status: 502,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Error-Type": "all-models-failed",
      },
    }
  )
}
