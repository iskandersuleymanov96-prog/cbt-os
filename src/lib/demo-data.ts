import type { JournalEntry, Pattern, AIInsight } from "@/types"

export const EMOTION_ICONS: Record<string, string> = {
  "Тревога": "😟",
  "Спокойствие": "😌",
  "Радость": "😊",
  "Вина": "😔",
  "Удовлетворение": "🙂",
  "Раздражение": "😤",
  "Стыд": "😣",
  "Гордость": "💪",
  "Паника": "😱",
  "Облегчение": "😮‍💨",
  "Грусть": "😢",
  "Злость": "😠",
}

export const PATTERN_TYPE_LABELS: Record<string, string> = {
  thought: "Мысли",
  emotion: "Эмоции",
  trigger: "Триггеры",
  distortion: "Искажения",
  behavior: "Поведение",
}

export const PATTERN_TYPE_COLORS: Record<string, string> = {
  thought: "bg-blue-100 text-blue-700",
  emotion: "bg-purple-100 text-purple-700",
  trigger: "bg-orange-100 text-orange-700",
  distortion: "bg-red-100 text-red-700",
  behavior: "bg-green-100 text-green-700",
}

export function calculateStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0
  const sorted = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  let streak = 0
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const dayStart = checkDate.getTime()
    const dayEnd = dayStart + 86400000
    const hasEntry = sorted.some(
      (e) => {
        const t = new Date(e.created_at).getTime()
        return t >= dayStart && t < dayEnd
      }
    )
    if (hasEntry) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}

export function getWeeklyData(entries: JournalEntry[]) {
  const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 86400000)
  const weekEntries = entries.filter(
    (e) => new Date(e.created_at).getTime() >= weekAgo.getTime()
  )

  const result = dayNames.map((day, i) => {
    const dayEntries = weekEntries.filter((e) => {
      const d = new Date(e.created_at)
      return d.getDay() === i
    })
    const avgMood = dayEntries.length > 0
      ? dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length
      : 0
    const avgStress = dayEntries.length > 0
      ? dayEntries.reduce((s, e) => s + e.stress, 0) / dayEntries.length
      : 0
    const avgAnxiety = dayEntries.length > 0
      ? dayEntries.reduce((s, e) => s + e.anxiety, 0) / dayEntries.length
      : 0
    return {
      day,
      mood: Math.round(avgMood * 10) / 10,
      stress: Math.round(avgStress * 10) / 10,
      anxiety: Math.round(avgAnxiety * 10) / 10,
    }
  })

  return result
}

export function getTodayStats(entries: JournalEntry[]) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const todayEntries = entries.filter(
    (e) => new Date(e.created_at).getTime() >= todayStart
  )

  const avgMood = todayEntries.length > 0
    ? Math.round((todayEntries.reduce((s, e) => s + e.mood, 0) / todayEntries.length) * 10) / 10
    : 0
  const distortionsCount = todayEntries.reduce(
    (s, e) => s + (e as JournalEntry & { distortions: string[] }).distortions.length,
    0
  )

  const lastEntry = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0]

  let lastActive = "Давно"
  if (lastEntry) {
    const diff = Date.now() - new Date(lastEntry.created_at).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) lastActive = "Только что"
    else if (hours < 24) lastActive = `${hours}ч назад`
    else {
      const days = Math.floor(hours / 24)
      lastActive = `${days} дн. назад`
    }
  }

  return { entriesCount: todayEntries.length, avgMood, distortionsCount, lastActive }
}

export function getWeekStats(entries: JournalEntry[]) {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 86400000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000)

  const thisWeek = entries.filter((e) => new Date(e.created_at).getTime() >= weekAgo.getTime())
  const lastWeek = entries.filter((e) => {
    const t = new Date(e.created_at).getTime()
    return t >= twoWeeksAgo.getTime() && t < weekAgo.getTime()
  })

  const avgMoodThisWeek = thisWeek.length > 0
    ? Math.round((thisWeek.reduce((s, e) => s + e.mood, 0) / thisWeek.length) * 10) / 10
    : 0
  const avgMoodLastWeek = lastWeek.length > 0
    ? Math.round((lastWeek.reduce((s, e) => s + e.mood, 0) / lastWeek.length) * 10) / 10
    : 0

  const allDistortions = thisWeek.flatMap(
    (e) => (e as JournalEntry & { distortions: string[] }).distortions
  )
  const distortionCounts = allDistortions.reduce<Record<string, number>>((acc, d) => {
    acc[d] = (acc[d] || 0) + 1
    return acc
  }, {})
  const topDistortion = Object.entries(distortionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || ""

  return {
    entriesThisWeek: thisWeek.length,
    entriesLastWeek: lastWeek.length,
    avgMoodThisWeek,
    avgMoodLastWeek,
    topDistortion,
  }
}

export function getMoodDistribution(entries: JournalEntry[]) {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  entries.forEach((e) => { counts[e.mood] = (counts[e.mood] || 0) + 1 })
  const total = entries.length || 1
  return [
    { name: "Плохо", value: Math.round((counts[1] / total) * 100), color: "#ef4444" },
    { name: "Нормально", value: Math.round((counts[2] / total) * 100), color: "#f97316" },
    { name: "Нейтрально", value: Math.round((counts[3] / total) * 100), color: "#eab308" },
    { name: "Хорошо", value: Math.round((counts[4] / total) * 100), color: "#4a6fa5" },
    { name: "Отлично", value: Math.round((counts[5] / total) * 100), color: "#22c55e" },
  ].filter((d) => d.value > 0)
}

export function getEmotionDistribution(entries: JournalEntry[]) {
  const counts: Record<string, number> = {}
  entries.forEach((e) => { counts[e.emotion] = (counts[e.emotion] || 0) + 1 })
  const total = entries.length || 1
  const colors: Record<string, string> = {
    "Тревога": "#ef4444",
    "Спокойствие": "#4a6fa5",
    "Радость": "#22c55e",
    "Вина": "#a855f7",
    "Раздражение": "#f97316",
    "Удовлетворение": "#06b6d4",
    "Стыд": "#ec4899",
    "Гордость": "#10b981",
    "Паника": "#dc2626",
    "Облегчение": "#60a5fa",
  }
  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      color: colors[name] || "#888",
    }))
    .sort((a, b) => b.value - a.value)
}

export function getDistortionFrequency(entries: JournalEntry[]) {
  const counts: Record<string, number> = {}
  entries.forEach((e) => {
    const distortions = (e as JournalEntry & { distortions: string[] }).distortions
    distortions.forEach((d) => { counts[d] = (counts[d] || 0) + 1 })
  })
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export function getGrowthPercentage(entries: JournalEntry[]): number {
  if (entries.length < 4) return 0
  const sorted = [...entries].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  const mid = Math.floor(sorted.length / 2)
  const firstHalf = sorted.slice(0, mid)
  const secondHalf = sorted.slice(mid)
  const avgFirst = firstHalf.reduce((s, e) => s + e.mood, 0) / firstHalf.length
  const avgSecond = secondHalf.reduce((s, e) => s + e.mood, 0) / secondHalf.length
  if (avgFirst === 0) return 0
  return Math.round(((avgSecond - avgFirst) / avgFirst) * 100)
}

export function getYearInPixels(entries: JournalEntry[]) {
  const colors = ["#ef4444", "#f97316", "#eab308", "#4a6fa5", "#22c55e"]
  const entriesByDay = new Map<number, number>()
  entries.forEach((e) => {
    const startOfYear = new Date(new Date(e.created_at).getFullYear(), 0, 0).getTime()
    const dayOfYear = Math.floor((new Date(e.created_at).getTime() - startOfYear) / 86400000)
    entriesByDay.set(dayOfYear, e.mood)
  })
  return Array.from({ length: 365 }, (_, i) => {
    const mood = entriesByDay.get(i + 1)
    return { day: i + 1, color: mood ? colors[mood - 1] : "#e5e7eb" }
  })
}
