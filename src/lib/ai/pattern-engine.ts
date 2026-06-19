import type { JournalEntry } from "@/types"

interface DistortionMatch {
  name: string
  slug: string
  keywords: string[]
}

const DISTORTIONS: DistortionMatch[] = [
  { name: "Катастрофизация", slug: "catastrophizing", keywords: ["ужас", "катастроф", "конец", "невозможно", "никогда", "обязательно уволят", "всё пропало", "худшее"] },
  { name: "Чтение мыслей", slug: "mind-reading", keywords: ["он дума", "она дума", "все дума", "точно дума", "наверняка", "думают что", "считают что", "знают что"] },
  { name: "Чёрно-белое мышление", slug: "black-and-white", keywords: ["всегда", "никогда", "полностью", "абсолютно", "или хорошо или плохо", "только один вариант", "нет середины", "идеально"] },
  { name: "Обобщение", slug: "overgeneralization", keywords: ["всегда когда", "каждый раз", "все люди", "я всегда", "это снова", "опять как обычно", "никогда не получается"] },
  { name: "Эмоциональное рассуждение", slug: "emotional-reasoning", keywords: ["я чувствую значит", "мне страшно значит", "это правда потому что чувствую", "внутри знаю что", "myślю что"] },
  { name: "Персонализация", slug: "personalization", keywords: ["из-за меня", "моя вина", "я виноват", "я причин", "из-за моей ошибки", "я испортил"] },
  { name: "Обесценивание позитива", slug: "discounting-positives", keywords: ["просто повезло", "это ничего не значит", "каждый мог бы", "не стоит", "вряд ли считать", "случайно"] },
  { name: "Долженствование", slug: "should-statements", keywords: ["я должен", "я обяз", "нужно было", "я обязан", "я не имею права", "мне положено"] },
  { name: "Маркировка", slug: "labeling", keywords: ["я неудачник", "я глуп", "я слаб", "я худший", "я ничтож", "я ужасн", "я лузер"] },
  { name: "Предсказание будущего", slug: "fortune-telling", keywords: ["точно не получится", "уверен что будет плохо", "предчувствую", "garantированно провалюсь", "обязательно случится"] },
]

interface EmotionCategory {
  positive: string[]
  negative: string[]
  neutral: string[]
}

const EMOTION_CATEGORIES: EmotionCategory = {
  positive: ["радость", "счастье", "спокойствие", "гордость", "удовлетворение", "уверенность", "благодарность", "вдохновение", "любовь", "interest"],
  negative: ["тревога", "страх", "гнев", "печаль", "разочарование", "стыд", "вина", "одиночество", "раздражение", "фрустрация", "беспокойство", "подавленность"],
  neutral: ["нейтрально", "спокойствие", "равнодушие", "усталость", "apatия"],
}

export interface AnalysisResult {
  distortions: DetectedDistortion[]
  emotionProfile: EmotionProfile
  triggerAnalysis: TriggerAnalysis
  thoughtPatterns: ThoughtPattern[]
  growthIndicators: GrowthIndicator[]
  entryCount: number
  dateRange: { first: string; last: string }
}

export interface DetectedDistortion {
  name: string
  slug: string
  frequency: number
  confidence: number
  relatedEntryIds: string[]
}

export interface EmotionProfile {
  dominant: string
  dominantCategory: "positive" | "negative" | "neutral"
  averageIntensity: number
  intensityTrend: "improving" | "stable" | "worsening"
  distribution: Record<string, number>
}

export interface TriggerAnalysis {
  topTags: Array<{ tag: string; count: number }>
  timePatterns: Array<{ period: string; count: number }>
  stressCorrelation: number
}

export interface ThoughtPattern {
  type: "recurring_thought" | "recurring_emotion" | "recurring_situation" | "cognitive_distortion"
  description: string
  frequency: number
  entryIds: string[]
}

export interface GrowthIndicator {
  type: "intensity_reduction" | "alternative_thinking" | "self_awareness" | "consistent_journaling"
  description: string
  magnitude: number
}

export interface PatternScores {
  pattern: number
  trigger: number
  distortion: number
  growth: number
}

function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2)
}

function countFrequency(items: string[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const item of items) {
    map.set(item, (map.get(item) ?? 0) + 1)
  }
  return map
}

function detectDistortionsInText(text: string): string[] {
  const lower = text.toLowerCase()
  const found: string[] = []
  for (const d of DISTORTIONS) {
    if (d.keywords.some((kw) => lower.includes(kw))) {
      found.push(d.slug)
    }
  }
  return found
}

function getTimePeriod(dateStr: string): string {
  const h = new Date(dateStr).getHours()
  if (h >= 5 && h < 12) return "утро"
  if (h >= 12 && h < 17) return "день"
  if (h >= 17 && h < 22) return "вечер"
  return "ночь"
}

function calculateCorrelation(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length)
  if (n < 2) return 0

  const xSlice = xs.slice(0, n)
  const ySlice = ys.slice(0, n)
  const meanX = xSlice.reduce((a, b) => a + b, 0) / n
  const meanY = ySlice.reduce((a, b) => a + b, 0) / n

  let num = 0
  let denX = 0
  let denY = 0
  for (let i = 0; i < n; i++) {
    const dx = xSlice[i] - meanX
    const dy = ySlice[i] - meanY
    num += dx * dy
    denX += dx * dx
    denY += dy * dy
  }
  const den = Math.sqrt(denX * denY)
  return den === 0 ? 0 : num / den
}

function computeIntensityTrend(entries: JournalEntry[]): "improving" | "stable" | "worsening" {
  if (entries.length < 2) return "stable"
  const sorted = [...entries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2))
  const secondHalf = sorted.slice(Math.floor(sorted.length / 2))

  const avgFirst = firstHalf.reduce((s, e) => s + e.emotion_intensity, 0) / firstHalf.length
  const avgSecond = secondHalf.reduce((s, e) => s + e.emotion_intensity, 0) / secondHalf.length

  const diff = avgFirst - avgSecond
  if (diff > 0.5) return "improving"
  if (diff < -0.5) return "worsening"
  return "stable"
}

export function analyzeEntries(entries: JournalEntry[]): AnalysisResult {
  if (entries.length === 0) {
    return {
      distortions: [],
      emotionProfile: { dominant: "", dominantCategory: "neutral", averageIntensity: 0, intensityTrend: "stable", distribution: {} },
      triggerAnalysis: { topTags: [], timePatterns: [], stressCorrelation: 0 },
      thoughtPatterns: [],
      growthIndicators: [],
      entryCount: 0,
      dateRange: { first: "", last: "" },
    }
  }

  const sorted = [...entries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  // Distortion detection
  const distortionMap = new Map<string, { count: number; entryIds: string[] }>()
  for (const entry of entries) {
    const texts = [entry.automatic_thought, entry.situation, entry.behavior, entry.evidence_supporting, entry.evidence_against].filter(Boolean)
    const combined = texts.join(" ")
    const detected = detectDistortionsInText(combined)
    for (const slug of detected) {
      const existing = distortionMap.get(slug) ?? { count: 0, entryIds: [] }
      existing.count++
      existing.entryIds.push(entry.id)
      distortionMap.set(slug, existing)
    }
  }

  const distortions: DetectedDistortion[] = []
  for (const [slug, data] of distortionMap) {
    const distInfo = DISTORTIONS.find((d) => d.slug === slug)
    if (distInfo) {
      distortions.push({
        name: distInfo.name,
        slug,
        frequency: data.count,
        confidence: Math.min(0.95, 0.4 + data.count * 0.15),
        relatedEntryIds: data.entryIds,
      })
    }
  }
  distortions.sort((a, b) => b.frequency - a.frequency)

  // Emotion profile
  const emotionCounts = countFrequency(entries.map((e) => e.emotion.toLowerCase()))
  let dominant = ""
  let maxCount = 0
  for (const [emotion, count] of emotionCounts) {
    if (count > maxCount) {
      maxCount = count
      dominant = emotion
    }
  }

  const dominantCategory: "positive" | "negative" | "neutral" = EMOTION_CATEGORIES.positive.some((e) => dominant.includes(e))
    ? "positive"
    : EMOTION_CATEGORIES.negative.some((e) => dominant.includes(e))
      ? "negative"
      : "neutral"

  const avgIntensity = entries.reduce((s, e) => s + e.emotion_intensity, 0) / entries.length

  const emotionProfile: EmotionProfile = {
    dominant,
    dominantCategory,
    averageIntensity: Math.round(avgIntensity * 10) / 10,
    intensityTrend: computeIntensityTrend(entries),
    distribution: Object.fromEntries([...emotionCounts.entries()].sort((a, b) => b[1] - a[1])),
  }

  // Trigger analysis
  const allTags = entries.flatMap((e) => e.tags)
  const tagCounts = countFrequency(allTags)
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }))

  const timePeriods = entries.map((e) => getTimePeriod(e.created_at))
  const timeCounts = countFrequency(timePeriods)
  const timePatterns = [...timeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([period, count]) => ({ period, count }))

  const stressValues = entries.map((e) => e.stress)
  const intensityValues = entries.map((e) => e.emotion_intensity)
  const stressCorrelation = Math.round(calculateCorrelation(stressValues, intensityValues) * 100) / 100

  const triggerAnalysis: TriggerAnalysis = { topTags, timePatterns, stressCorrelation }

  // Thought patterns
  const thoughtPatterns: ThoughtPattern[] = []

  // Recurring emotions (3+ times)
  for (const [emotion, count] of emotionCounts) {
    if (count >= 3) {
      const relatedIds = entries.filter((e) => e.emotion.toLowerCase() === emotion).map((e) => e.id)
      thoughtPatterns.push({
        type: "recurring_emotion",
        description: `Эмоция «${emotion}» встречается ${count} раз`,
        frequency: count,
        entryIds: relatedIds,
      })
    }
  }

  // Recurring tags (3+ times)
  for (const [tag, count] of tagCounts) {
    if (count >= 3) {
      const relatedIds = entries.filter((e) => e.tags.includes(tag)).map((e) => e.id)
      thoughtPatterns.push({
        type: "recurring_situation",
        description: `Тема «${tag}» повторяется ${count} раз`,
        frequency: count,
        entryIds: relatedIds,
      })
    }
  }

  // Distortion patterns (2+ times)
  for (const d of distortions) {
    if (d.frequency >= 2) {
      thoughtPatterns.push({
        type: "cognitive_distortion",
        description: `Искажение «${d.name}» обнаружено ${d.frequency} раз`,
        frequency: d.frequency,
        entryIds: d.relatedEntryIds,
      })
    }
  }

  // Recurring thoughts (similar automatic thoughts)
  const thoughtsBySimilarity = findSimilarThoughts(entries)
  for (const group of thoughtsBySimilarity) {
    if (group.entryIds.length >= 3) {
      thoughtPatterns.push({
        type: "recurring_thought",
        description: `Похожие мысли: «${group.sample}»`,
        frequency: group.entryIds.length,
        entryIds: group.entryIds,
      })
    }
  }

  thoughtPatterns.sort((a, b) => b.frequency - a.frequency)

  // Growth indicators
  const growthIndicators: GrowthIndicator[] = []

  // Intensity reduction
  const intensityReduction = entries.filter((e) => e.emotion_intensity > e.new_emotion_intensity)
  if (intensityReduction.length >= 2) {
    const avgReduction = intensityReduction.reduce((s, e) => s + (e.emotion_intensity - e.new_emotion_intensity), 0) / intensityReduction.length
    growthIndicators.push({
      type: "intensity_reduction",
      description: `Снижение интенсивности эмоций в ${intensityReduction.length} записях (в среднем на ${avgReduction.toFixed(1)} баллов)`,
      magnitude: Math.min(100, Math.round(avgReduction * 15)),
    })
  }

  // Alternative thinking
  const withAlternatives = entries.filter((e) => e.alternative_thought && e.alternative_thought.length > 10)
  if (withAlternatives.length >= 2) {
    growthIndicators.push({
      type: "alternative_thinking",
      description: `Вы нашли альтернативные мысли в ${withAlternatives.length} из ${entries.length} записей`,
      magnitude: Math.round((withAlternatives.length / entries.length) * 100),
    })
  }

  // Self-awareness (lessons learned)
  const withLessons = entries.filter((e) => e.lessons_learned && e.lessons_learned.length > 10)
  if (withLessons.length >= 2) {
    growthIndicators.push({
      type: "self_awareness",
      description: `Записано ${withLessons.length} выводов о себе и своих паттернах`,
      magnitude: Math.round((withLessons.length / entries.length) * 100),
    })
  }

  // Consistent journaling
  if (entries.length >= 5) {
    const days = new Set(entries.map((e) => new Date(e.created_at).toDateString()))
    if (days.size >= 5) {
      growthIndicators.push({
        type: "consistent_journaling",
        description: `Регулярное ведение дневника: ${days.size} активных дней`,
        magnitude: Math.min(100, days.size * 15),
      })
    }
  }

  growthIndicators.sort((a, b) => b.magnitude - a.magnitude)

  return {
    distortions,
    emotionProfile,
    triggerAnalysis,
    thoughtPatterns,
    growthIndicators,
    entryCount: entries.length,
    dateRange: {
      first: sorted[0].created_at,
      last: sorted[sorted.length - 1].created_at,
    },
  }
}

function findSimilarThoughts(entries: JournalEntry[]): Array<{ sample: string; entryIds: string[] }> {
  const groups: Array<{ words: Set<string>; sample: string; entryIds: string[] }> = []

  for (const entry of entries) {
    const words = new Set(extractWords(entry.automatic_thought))
    let merged = false

    for (const group of groups) {
      const intersection = [...words].filter((w) => group.words.has(w)).length
      const union = new Set([...words, ...group.words]).size
      const similarity = union > 0 ? intersection / union : 0

      if (similarity > 0.4) {
        for (const w of words) group.words.add(w)
        group.entryIds.push(entry.id)
        merged = true
        break
      }
    }

    if (!merged) {
      groups.push({ words, sample: entry.automatic_thought, entryIds: [entry.id] })
    }
  }

  return groups.filter((g) => g.entryIds.length >= 2)
}

export function calculatePatternScore(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0

  const analysis = analyzeEntries(entries)
  let score = 0

  // More entries = more data to detect patterns (up to 30 points)
  score += Math.min(30, entries.length * 3)

  // Recurring emotions (up to 25 points)
  const recurringEmotions = analysis.thoughtPatterns.filter((p) => p.type === "recurring_emotion")
  score += Math.min(25, recurringEmotions.length * 8)

  // Recurring tags/themes (up to 20 points)
  const recurringThemes = analysis.thoughtPatterns.filter((p) => p.type === "recurring_situation")
  score += Math.min(20, recurringThemes.length * 7)

  // Recurring thoughts (up to 25 points)
  const recurringThoughts = analysis.thoughtPatterns.filter((p) => p.type === "recurring_thought")
  score += Math.min(25, recurringThoughts.length * 10)

  return Math.min(100, Math.round(score))
}

export function calculateTriggerScore(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0

  const allTags = entries.flatMap((e) => e.tags)
  const tagCounts = countFrequency(allTags)
  const uniqueTags = tagCounts.size

  let score = 0

  // Number of unique tags (up to 30)
  score += Math.min(30, uniqueTags * 5)

  // Repeated tags indicate identifiable triggers (up to 40)
  const repeatedTags = [...tagCounts.values()].filter((c) => c >= 2).length
  score += Math.min(40, repeatedTags * 10)

  // Time pattern consistency (up to 30)
  const timePeriods = entries.map((e) => getTimePeriod(e.created_at))
  const timeCounts = countFrequency(timePeriods)
  const maxTimeCount = Math.max(...timeCounts.values(), 0)
  score += Math.min(30, Math.round((maxTimeCount / entries.length) * 30))

  return Math.min(100, Math.round(score))
}

export function calculateDistortionScore(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0

  const analysis = analyzeEntries(entries)
  let score = 0

  // Number of distinct distortions found (up to 50)
  score += Math.min(50, analysis.distortions.length * 10)

  // Total distortion occurrences (up to 30)
  const totalOccurrences = analysis.distortions.reduce((s, d) => s + d.frequency, 0)
  score += Math.min(30, totalOccurrences * 3)

  // Average confidence of detections (up to 20)
  if (analysis.distortions.length > 0) {
    const avgConf = analysis.distortions.reduce((s, d) => s + d.confidence, 0) / analysis.distortions.length
    score += Math.round(avgConf * 20)
  }

  return Math.min(100, Math.round(score))
}

export function calculateGrowthScore(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0

  let score = 0

  // Intensity reduction (up to 30)
  const withReduction = entries.filter((e) => e.emotion_intensity > e.new_emotion_intensity)
  score += Math.min(30, Math.round((withReduction.length / entries.length) * 30))

  // Alternative thinking usage (up to 25)
  const withAlternatives = entries.filter((e) => e.alternative_thought && e.alternative_thought.length > 10)
  score += Math.min(25, Math.round((withAlternatives.length / entries.length) * 25))

  // Lessons learned (up to 20)
  const withLessons = entries.filter((e) => e.lessons_learned && e.lessons_learned.length > 10)
  score += Math.min(20, Math.round((withLessons.length / entries.length) * 20))

  // Mood improvement trend (up to 25)
  const sorted = [...entries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  if (sorted.length >= 2) {
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2))
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2))
    const avgMoodFirst = firstHalf.reduce((s, e) => s + e.mood, 0) / firstHalf.length
    const avgMoodSecond = secondHalf.reduce((s, e) => s + e.mood, 0) / secondHalf.length
    const moodDiff = avgMoodSecond - avgMoodFirst
    if (moodDiff > 0) {
      score += Math.min(25, Math.round(moodDiff * 10))
    }
  }

  return Math.min(100, Math.round(score))
}

export function detectRecurringThemes(entries: JournalEntry[]): ThoughtPattern[] {
  const analysis = analyzeEntries(entries)
  return analysis.thoughtPatterns.filter((p) => p.frequency >= 3)
}

export function generateInsights(entries: JournalEntry[]): string[] {
  if (entries.length < 2) return ["Недостаточно записей для анализа. Продолжайте вести дневник."]

  const analysis = analyzeEntries(entries)
  const insights: string[] = []

  // Emotion insight
  if (analysis.emotionProfile.dominant) {
    const cat = analysis.emotionProfile.dominantCategory === "positive" ? "позитивная" : analysis.emotionProfile.dominantCategory === "negative" ? "негативная" : "нейтральная"
    insights.push(`Преобладающая эмоция: «${analysis.emotionProfile.dominant}» (${cat}). Средняя интенсивность: ${analysis.emotionProfile.averageIntensity}.`)
  }

  // Intensity trend
  if (analysis.emotionProfile.intensityTrend === "improving") {
    insights.push("Интенсивность негативных эмоций снижается — это хороший знак прогресса.")
  } else if (analysis.emotionProfile.intensityTrend === "worsening") {
    insights.push("Интенсивность эмоций растёт. Обратите внимание на недавние триггеры.")
  }

  // Top distortion
  if (analysis.distortions.length > 0) {
    const top = analysis.distortions[0]
    insights.push(`Частое искажение: «${top.name}» (${top.frequency} раз). Попробуйте технику оспаривания для этого паттерна.`)
  }

  // Distortion pairs
  if (analysis.distortions.length >= 2) {
    insights.push(`Часто встречаются вместе: «${analysis.distortions[0].name}» и «${analysis.distortions[1].name}». Это может быть связанная когнитивная привычка.`)
  }

  // Tag triggers
  if (analysis.triggerAnalysis.topTags.length > 0) {
    const top = analysis.triggerAnalysis.topTags[0]
    insights.push(`Тема «${top.tag}» встречается в ${top.count} записях — потенциальный триггер.`)
  }

  // Growth indicators
  if (analysis.growthIndicators.length > 0) {
    const best = analysis.growthIndicators[0]
    insights.push(`Область роста: ${best.description}`)
  }

  // Correlation insight
  if (Math.abs(analysis.triggerAnalysis.stressCorrelation) > 0.5) {
    const direction = analysis.triggerAnalysis.stressCorrelation > 0 ? "положительная" : "отрицательная"
    insights.push(`Обнаружена ${direction} корреляция (r=${analysis.triggerAnalysis.stressCorrelation}) между стрессом и интенсивностью эмоций.`)
  }

  // Alternative thinking ratio
  const withAlt = entries.filter((e) => e.alternative_thought && e.alternative_thought.length > 10).length
  if (withAlt > 0) {
    const pct = Math.round((withAlt / entries.length) * 100)
    insights.push(`Вы нашли альтернативные мысли в ${pct}% записей. ${pct >= 60 ? "Отличная работа!" : "Попробуйте чаще заменять автоматические мысли на более сбалансированные."}`)
  }

  if (insights.length === 0) {
    insights.push("Пока недостаточно данных для глубокого анализа. Ведите дневник регулярно для выявления паттернов.")
  }

  return insights
}
