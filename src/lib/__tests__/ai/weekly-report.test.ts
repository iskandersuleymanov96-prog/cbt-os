import { describe, it, expect } from "vitest"
import { generateWeeklyReport } from "@/lib/ai/weekly-report"
import type { JournalEntry } from "@/types"

function makeEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: "1",
    user_id: "user-1",
    created_at: "2025-01-15T10:00:00Z",
    situation: "Work meeting",
    emotion: "тревога",
    emotion_intensity: 7,
    automatic_thought: "Я обязательно уволят",
    body_sensations: "tight chest",
    behavior: "stayed quiet",
    evidence_supporting: "I stumbled last time",
    evidence_against: "They appreciated my input before",
    alternative_thought: "One mistake doesn't define me",
    new_emotion_intensity: 4,
    lessons_learned: "Перфекционизм мешает",
    mood: 3,
    energy: 4,
    stress: 7,
    anxiety: 6,
    tags: ["работа"],
    ...overrides,
  }
}

describe("generateWeeklyReport", () => {
  it("returns empty report when no entries fall in the week", () => {
    const entries = [makeEntry({ created_at: "2025-03-10T10:00:00Z" })]
    const report = generateWeeklyReport(entries, "2025-01-13")
    expect(report.total_entries).toBe(0)
    expect(report.average_mood).toBe(0)
    expect(report.insights).toContain("Нет записей за эту неделю.")
  })

  it("generates correct averages for a single entry", () => {
    const entries = [makeEntry({ id: "e1", created_at: "2025-01-15T10:00:00Z", mood: 4, stress: 6, anxiety: 5 })]
    const report = generateWeeklyReport(entries, "2025-01-13")
    expect(report.total_entries).toBe(1)
    expect(report.average_mood).toBe(4)
    expect(report.average_stress).toBe(6)
    expect(report.average_anxiety).toBe(5)
  })

  it("calculates correct averages across multiple entries", () => {
    const entries = [
      makeEntry({ id: "e1", created_at: "2025-01-13T10:00:00Z", mood: 2, stress: 8, anxiety: 7 }),
      makeEntry({ id: "e2", created_at: "2025-01-14T10:00:00Z", mood: 4, stress: 4, anxiety: 3 }),
      makeEntry({ id: "e3", created_at: "2025-01-16T10:00:00Z", mood: 3, stress: 6, anxiety: 5 }),
    ]
    const report = generateWeeklyReport(entries, "2025-01-13")
    expect(report.total_entries).toBe(3)
    expect(report.average_mood).toBe(3)
    expect(report.average_stress).toBe(6)
    expect(report.average_anxiety).toBe(5)
  })

  it("includes distortions and triggers when detected", () => {
    const entries = Array.from({ length: 4 }, (_, i) =>
      makeEntry({
        id: `e${i}`,
        created_at: `2025-01-${13 + i}T10:00:00Z`,
        automatic_thought: "Я обязательно уволят если ошибусь",
        tags: ["работа", "стресс"],
      })
    )
    const report = generateWeeklyReport(entries, "2025-01-13")
    expect(report.common_triggers).toContain("работа")
    expect(report.insights.length).toBeGreaterThan(0)
  })

  it("includes regularity insight for 5+ entries", () => {
    const entries = Array.from({ length: 5 }, (_, i) =>
      makeEntry({
        id: `e${i}`,
        created_at: `2025-01-${13 + i}T10:00:00Z`,
      })
    )
    const report = generateWeeklyReport(entries, "2025-01-13")
    expect(report.insights.some((i) => i.includes("регулярность"))).toBe(true)
  })
})
