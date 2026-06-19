import type { JournalEntry, MonthlyReport } from "@/types"
import { analyzeEntries } from "./pattern-engine"
import { generateWeeklyReport } from "./weekly-report"

export function generateMonthlyReport(entries: JournalEntry[], month: number, year: number): MonthlyReport {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999)

  const monthEntries = entries.filter((e) => {
    const d = new Date(e.created_at)
    return d >= monthStart && d <= monthEnd
  })

  if (monthEntries.length === 0) {
    return {
      id: `monthly-${year}-${month}`,
      user_id: entries[0]?.user_id ?? "demo",
      month,
      year,
      total_entries: 0,
      average_mood: 0,
      average_stress: 0,
      average_anxiety: 0,
      common_distortions: [],
      common_triggers: [],
      growth_score: 0,
      insights: ["Нет записей за этот месяц."],
      patterns_discovered: [],
    }
  }

  const avgMood = Math.round((monthEntries.reduce((s, e) => s + e.mood, 0) / monthEntries.length) * 10) / 10
  const avgStress = Math.round((monthEntries.reduce((s, e) => s + e.stress, 0) / monthEntries.length) * 10) / 10
  const avgAnxiety = Math.round((monthEntries.reduce((s, e) => s + e.anxiety, 0) / monthEntries.length) * 10) / 10

  const analysis = analyzeEntries(monthEntries)

  const commonDistortions = analysis.distortions.slice(0, 5).map((d) => d.name)
  const commonTriggers = analysis.triggerAnalysis.topTags.slice(0, 5).map((t) => t.tag)
  const patternsDiscovered = analysis.thoughtPatterns.filter((p) => p.frequency >= 3).map((p) => p.description)

  // Weekly trends
  const weeks: string[] = []
  const current = new Date(monthStart)
  while (current <= monthEnd) {
    weeks.push(current.toISOString())
    current.setDate(current.getDate() + 7)
  }

  const weeklyReports = weeks.map((ws) => generateWeeklyReport(entries, ws))

  // Build insights
  const insights: string[] = []

  // Overall mood
  const moodLabel = avgMood >= 4 ? "хорошее" : avgMood >= 2.5 ? "среднее" : "низкое"
  insights.push(`Среднее настроение за месяц: ${avgMood} (${moodLabel}). Стресс: ${avgStress}, тревога: ${avgAnxiety}.`)

  // Weekly trends
  if (weeklyReports.length >= 2) {
    const moodTrend = weeklyReports.map((r) => r.average_mood)
    const improving = moodTrend[moodTrend.length - 1] > moodTrend[0]
    if (improving) {
      insights.push("Настроение улучшается от недели к неделе — положительная динамика.")
    } else if (moodTrend[moodTrend.length - 1] < moodTrend[0]) {
      insights.push("Настроение снижается в течение месяца. Рекомендуется обсудить это с терапевтом.")
    } else {
      insights.push("Настроение стабильно на протяжении месяца.")
    }
  }

  // Patterns
  if (patternsDiscovered.length > 0) {
    insights.push(`Обнаружено ${patternsDiscovered.length} повторяющихся паттернов: ${patternsDiscovered.slice(0, 3).join("; ")}.`)
  }

  // Distortion changes
  if (commonDistortions.length > 0) {
    insights.push(`Основные искажения за месяц: ${commonDistortions.join(", ")}.`)
  }

  // Growth trajectory
  if (analysis.growthIndicators.length > 0) {
    insights.push(`Области роста: ${analysis.growthIndicators.map((g) => g.description).join("; ")}.`)
  }

  // Consistency
  const uniqueDays = new Set(monthEntries.map((e) => new Date(e.created_at).toDateString())).size
  insights.push(`Активных дней: ${uniqueDays} из ${monthEnd.getDate()} (${Math.round((uniqueDays / monthEnd.getDate()) * 100)}%).`)

  // Intensity trend
  if (analysis.emotionProfile.intensityTrend === "improving") {
    insights.push("Интенсивность эмоций снижается — признак прогресса в управлении эмоциями.")
  }

  return {
    id: `monthly-${year}-${month}`,
    user_id: monthEntries[0].user_id,
    month,
    year,
    total_entries: monthEntries.length,
    average_mood: avgMood,
    average_stress: avgStress,
    average_anxiety: avgAnxiety,
    common_distortions: commonDistortions,
    common_triggers: commonTriggers,
    growth_score: analysis.growthIndicators[0]?.magnitude ?? 0,
    insights,
    patterns_discovered: patternsDiscovered,
  }
}
