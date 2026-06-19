import { describe, it, expect } from "vitest"
import {
  analyzeEntries,
  calculatePatternScore,
  calculateGrowthScore,
  detectRecurringThemes,
} from "@/lib/ai/pattern-engine"
import type { JournalEntry } from "@/types"

function makeEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: "1",
    user_id: "user-1",
    created_at: "2025-01-15T10:00:00Z",
    situation: "Work meeting",
    emotion: "тревога",
    emotion_intensity: 7,
    automatic_thought: "Я обязательно уволят если я скажу что-то глупое",
    body_sensations: "tight chest",
    behavior: "stayed quiet",
    evidence_supporting: "I stumbled last time",
    evidence_against: "They appreciated my input before",
    alternative_thought: "One mistake doesn't define me",
    new_emotion_intensity: 4,
    lessons_learned: "Перфекционизм мешает быть собой",
    mood: 2,
    energy: 3,
    stress: 8,
    anxiety: 7,
    tags: ["работа", "встреча"],
    ...overrides,
  }
}

describe("analyzeEntries", () => {
  it("returns empty result for no entries", () => {
    const result = analyzeEntries([])
    expect(result.entryCount).toBe(0)
    expect(result.distortions).toHaveLength(0)
    expect(result.thoughtPatterns).toHaveLength(0)
    expect(result.growthIndicators).toHaveLength(0)
    expect(result.dateRange.first).toBe("")
  })

  it("detects cognitive distortions from text", () => {
    const entries = [
      makeEntry({ id: "e1", automatic_thought: "Я обязательно уволят если ошибусь" }),
      makeEntry({ id: "e2", automatic_thought: "Я обязательно уволят за опоздание" }),
    ]
    const result = analyzeEntries(entries)
    const slugs = result.distortions.map((d) => d.slug)
    expect(slugs).toContain("catastrophizing")
  })

  it("builds correct emotion profile with dominant emotion", () => {
    const entries = [
      makeEntry({ id: "e1", emotion: "тревога", emotion_intensity: 8 }),
      makeEntry({ id: "e2", emotion: "тревога", emotion_intensity: 6 }),
      makeEntry({ id: "e3", emotion: "гнев", emotion_intensity: 5 }),
    ]
    const result = analyzeEntries(entries)
    expect(result.emotionProfile.dominant).toBe("тревога")
    expect(result.emotionProfile.dominantCategory).toBe("negative")
    expect(result.emotionProfile.averageIntensity).toBeCloseTo(6.3, 0)
  })

  it("computes trigger analysis with top tags", () => {
    const entries = [
      makeEntry({ id: "e1", tags: ["работа", "дедлайн"] }),
      makeEntry({ id: "e2", tags: ["работа", "коллеги"] }),
      makeEntry({ id: "e3", tags: ["работа", "стресс"] }),
    ]
    const result = analyzeEntries(entries)
    expect(result.triggerAnalysis.topTags[0].tag).toBe("работа")
    expect(result.triggerAnalysis.topTags[0].count).toBe(3)
  })

  it("identifies recurring emotions as thought patterns (3+ occurrences)", () => {
    const entries = [
      makeEntry({ id: "e1", emotion: "тревога" }),
      makeEntry({ id: "e2", emotion: "тревога" }),
      makeEntry({ id: "e3", emotion: "тревога" }),
    ]
    const result = analyzeEntries(entries)
    const recurring = result.thoughtPatterns.filter((p) => p.type === "recurring_emotion")
    expect(recurring.length).toBeGreaterThanOrEqual(1)
    expect(recurring[0].frequency).toBe(3)
  })

  it("detects growth indicators when intensity decreases", () => {
    const entries = [
      makeEntry({ id: "e1", emotion_intensity: 9, new_emotion_intensity: 3 }),
      makeEntry({ id: "e2", emotion_intensity: 8, new_emotion_intensity: 2 }),
      makeEntry({ id: "e3", emotion_intensity: 7, new_emotion_intensity: 4 }),
    ]
    const result = analyzeEntries(entries)
    const intensityGrowth = result.growthIndicators.filter((g) => g.type === "intensity_reduction")
    expect(intensityGrowth.length).toBe(1)
    expect(intensityGrowth[0].magnitude).toBeGreaterThan(0)
  })
})

describe("calculatePatternScore", () => {
  it("returns 0 for empty entries", () => {
    expect(calculatePatternScore([])).toBe(0)
  })

  it("returns higher score with more entries and recurring patterns", () => {
    const entries = Array.from({ length: 8 }, (_, i) =>
      makeEntry({
        id: `e${i}`,
        emotion: "тревога",
        tags: ["работа"],
        automatic_thought: "Я обязательно уволят если ошибусь",
      })
    )
    const score = calculatePatternScore(entries)
    expect(score).toBeGreaterThan(20)
    expect(score).toBeLessThanOrEqual(100)
  })
})

describe("calculateGrowthScore", () => {
  it("returns 0 for empty entries", () => {
    expect(calculateGrowthScore([])).toBe(0)
  })

  it("returns higher score when entries show improvement", () => {
    const entries = [
      makeEntry({ id: "e1", emotion_intensity: 9, new_emotion_intensity: 2, alternative_thought: "Альтернативная мысль длинная", lessons_learned: "Вывод для себя", mood: 1 }),
      makeEntry({ id: "e2", emotion_intensity: 8, new_emotion_intensity: 3, alternative_thought: "Другая альтернативная мысль", lessons_learned: "Ещё один вывод", mood: 2 }),
      makeEntry({ id: "e3", emotion_intensity: 7, new_emotion_intensity: 4, alternative_thought: "Третья мысль альтернативная", lessons_learned: "Третий вывод", mood: 3 }),
    ]
    const score = calculateGrowthScore(entries)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

describe("detectRecurringThemes", () => {
  it("returns empty for no recurring themes", () => {
    const entries = [
      makeEntry({ id: "e1", emotion: "радость", tags: ["семья"] }),
    ]
    const themes = detectRecurringThemes(entries)
    expect(themes).toHaveLength(0)
  })

  it("detects themes appearing 3+ times", () => {
    const entries = Array.from({ length: 5 }, (_, i) =>
      makeEntry({ id: `e${i}`, emotion: "тревога", tags: ["работа"] })
    )
    const themes = detectRecurringThemes(entries)
    expect(themes.length).toBeGreaterThanOrEqual(1)
    expect(themes.some((t) => t.type === "recurring_emotion")).toBe(true)
  })
})
