import type { JournalEntry, WeeklyReport } from "@/types"
import { analyzeEntries } from "./pattern-engine"

export function generateWeeklyReport(entries: JournalEntry[], weekStart: string): WeeklyReport {
  const startDate = new Date(weekStart)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)
  endDate.setHours(23, 59, 59, 999)

  const weekEntries = entries.filter((e) => {
    const d = new Date(e.created_at)
    return d >= startDate && d <= endDate
  })

  if (weekEntries.length === 0) {
    return {
      id: `weekly-${weekStart}`,
      user_id: entries[0]?.user_id ?? "demo",
      week_start: weekStart,
      week_end: endDate.toISOString(),
      total_entries: 0,
      average_mood: 0,
      average_stress: 0,
      average_anxiety: 0,
      common_distortions: [],
      common_triggers: [],
      growth_score: 0,
      insights: ["Нет записей за эту неделю."],
    }
  }

  const totalMood = weekEntries.reduce((s, e) => s + e.mood, 0)
  const totalStress = weekEntries.reduce((s, e) => s + e.stress, 0)
  const totalAnxiety = weekEntries.reduce((s, e) => s + e.anxiety, 0)

  const avgMood = Math.round((totalMood / weekEntries.length) * 10) / 10
  const avgStress = Math.round((totalStress / weekEntries.length) * 10) / 10
  const avgAnxiety = Math.round((totalAnxiety / weekEntries.length) * 10) / 10

  const analysis = analyzeEntries(weekEntries)

  const commonDistortions = analysis.distortions.slice(0, 5).map((d) => d.name)
  const commonTriggers = analysis.triggerAnalysis.topTags.slice(0, 5).map((t) => t.tag)

  // Build insights
  const insights: string[] = []

  // Mood summary
  const moodLabel = avgMood >= 4 ? "хорошее" : avgMood >= 2.5 ? "среднее" : "низкое"
  insights.push(`Среднее настроение за неделю: ${avgMood} (${moodLabel}). Стресс: ${avgStress}, тревога: ${avgAnxiety}.`)

  // Emotion trend
  if (analysis.emotionProfile.intensityTrend === "improving") {
    insights.push("Интенсивность негативных эмоций снижается — позитивная динамика.")
  } else if (analysis.emotionProfile.intensityTrend === "worsening") {
    insights.push("Эмоциональная нагрузка возрастает. Рекомендуется обратить внимание на триггеры.")
  }

  // Distortions
  if (commonDistortions.length > 0) {
    insights.push(`Частые искажения: ${commonDistortions.join(", ")}.`)
  }

  // Growth
  if (analysis.growthIndicators.length > 0) {
    insights.push(`Прогресс: ${analysis.growthIndicators[0].description}`)
  }

  // Entry count insight
  if (weekEntries.length >= 5) {
    insights.push("Отличная регулярность — 5+ записей за неделю!")
  } else if (weekEntries.length <= 2) {
    insights.push("Попробуйте записывать больше для более точного анализа.")
  }

  return {
    id: `weekly-${weekStart}`,
    user_id: weekEntries[0].user_id,
    week_start: weekStart,
    week_end: endDate.toISOString(),
    total_entries: weekEntries.length,
    average_mood: avgMood,
    average_stress: avgStress,
    average_anxiety: avgAnxiety,
    common_distortions: commonDistortions,
    common_triggers: commonTriggers,
    growth_score: analysis.growthIndicators[0]?.magnitude ?? 0,
    insights,
  }
}
