import { NextRequest, NextResponse } from "next/server"
import type { JournalEntry } from "@/types"
import { analyzeEntries, calculatePatternScore, calculateTriggerScore, calculateDistortionScore, calculateGrowthScore, generateInsights } from "@/lib/ai/pattern-engine"
import { generateAllInsights } from "@/lib/ai/insight-engine"

export async function POST(request: NextRequest) {
  try {
    const { entry, entries } = await request.json()

    // Single entry mode — backward compatible with existing callers
    if (entry && !entries) {
      return analyzeSingleEntry(entry)
    }

    // Multi-entry mode — full pattern analysis
    if (entries && Array.isArray(entries)) {
      return analyzeMultipleEntries(entries as JournalEntry[])
    }

    return NextResponse.json({ error: "Требуется entry или entries" }, { status: 400 })
  } catch (error) {
    console.error("AI analyze error:", error)
    return NextResponse.json({
      distortions: [{ name: "Катастрофизация", confidence: 0.6 }],
      alternative_thought: "Попробуйте посмотреть на ситуацию с другой стороны.",
      insight_level: "low",
    })
  }
}

function analyzeSingleEntry(entry: JournalEntry) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    // Demo mode — use local analysis
    const texts = [entry.automatic_thought, entry.situation, entry.behavior].filter(Boolean).join(" ")
    const localDistortions = detectLocalDistortions(texts)

    return NextResponse.json({
      distortions: localDistortions,
      alternative_thought: entry.alternative_thought || "Попробуйте рассмотреть ситуацию с другой точки зрения.",
      insight_level: entry.emotion_intensity <= 3 ? "high" : entry.emotion_intensity <= 6 ? "medium" : "low",
    })
  }

  // Live mode — call LLM
  const baseUrl = process.env.OPENROUTER_API_KEY
    ? "https://openrouter.ai/api/v1"
    : "https://api.openai.com/v1"

  return fetch(`${baseUrl}/chat/completions`, {
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
          content: `Проанализируй запись КПТ-дневника и определи:
1. Какие когнитивные искажения присутствуют (из списка: катастрофизация, чтение мыслей, чёрно-белое мышление, обобщение, эмоциональное рассуждение, персонализация, обесценивание позитива, долженствование, маркировка, предсказание будущего)
2. Предложи альтернативную мысль
3. Оцени уровень инсайтов (high/medium/low)

Ответь в JSON формате:
{
  "distortions": [{"name": "...", "confidence": 0.8}],
  "alternative_thought": "...",
  "insight_level": "medium"
}`,
        },
        {
          role: "user",
          content: `Ситуация: ${entry.situation}\nЭмоция: ${entry.emotion}\nАвтоматическая мысль: ${entry.automatic_thought}\nДоказательства за: ${entry.evidence_supporting || "нет"}\nДоказательства против: ${entry.evidence_against || "нет"}`,
        },
      ],
      response_format: { type: "json_object" },
    }),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      return NextResponse.json(JSON.parse(data.choices[0]?.message?.content ?? "{}"))
    })
    .catch(() => {
      const texts = [entry.automatic_thought, entry.situation].filter(Boolean).join(" ")
      return NextResponse.json({
        distortions: detectLocalDistortions(texts),
        alternative_thought: entry.alternative_thought || "Попробуйте рассмотреть ситуацию с другой точки зрения.",
        insight_level: "low",
      })
    })
}

function analyzeMultipleEntries(entries: JournalEntry[]) {
  const analysis = analyzeEntries(entries)
  const patternScore = calculatePatternScore(entries)
  const triggerScore = calculateTriggerScore(entries)
  const distortionScore = calculateDistortionScore(entries)
  const growthScore = calculateGrowthScore(entries)
  const insights = generateInsights(entries)
  const aiInsights = generateAllInsights(entries)

  return NextResponse.json({
    scores: {
      pattern: patternScore,
      trigger: triggerScore,
      distortion: distortionScore,
      growth: growthScore,
    },
    distortions: analysis.distortions,
    emotionProfile: analysis.emotionProfile,
    triggerAnalysis: analysis.triggerAnalysis,
    thoughtPatterns: analysis.thoughtPatterns,
    growthIndicators: analysis.growthIndicators,
    insights,
    aiInsights,
    entryCount: analysis.entryCount,
    dateRange: analysis.dateRange,
  })
}

const DISTORTION_KEYWORDS: Record<string, string[]> = {
  "Катастрофизация": ["ужас", "катастроф", "конец", "всё пропало", "худшее", "обязательно уволят"],
  "Чтение мыслей": ["он дума", "она дума", "все дума", "точно дума", "наверняка", "думают что"],
  "Чёрно-белое мышление": ["всегда", "никогда", "абсолютно", "идеально", "полностью"],
  "Обобщение": ["каждый раз", "все люди", "я всегда", "это снова", "опять как обычно"],
  "Эмоциональное рассуждение": ["я чувствую значит", "мне страшно значит", "внутри знаю"],
  "Персонализация": ["из-за меня", "моя вина", "я виноват", "я причин"],
  "Обесценивание позитива": ["просто повезло", "это ничего не значит", "не стоит"],
  "Долженствование": ["я должен", "я обяз", "нужно было", "я обязан"],
  "Маркировка": ["я неудачник", "я глуп", "я слаб", "я худший", "я ничтож"],
  "Предсказание будущего": ["точно не получится", "уверен что будет плохо", "обязательно случится"],
}

function detectLocalDistortions(text: string): Array<{ name: string; confidence: number }> {
  const lower = text.toLowerCase()
  const results: Array<{ name: string; confidence: number }> = []

  for (const [name, keywords] of Object.entries(DISTORTION_KEYWORDS)) {
    const matchCount = keywords.filter((kw) => lower.includes(kw)).length
    if (matchCount > 0) {
      results.push({
        name,
        confidence: Math.min(0.95, 0.5 + matchCount * 0.15),
      })
    }
  }

  results.sort((a, b) => b.confidence - a.confidence)
  return results.length > 0 ? results : [{ name: "Катастрофизация", confidence: 0.5 }]
}
