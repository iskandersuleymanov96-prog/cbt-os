import { createClient } from "@/lib/supabase/client"
import type { JournalEntry } from "@/types"

const supabase = createClient()

function isDemo() {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL
}

// Demo data
const demoEntries: JournalEntry[] = [
  {
    id: "demo-1",
    user_id: "demo",
    created_at: "2026-06-19T14:30:00Z",
    situation: "Совещание по проекту — начальник критиковал мою работу перед командой",
    emotion: "Тревога",
    emotion_intensity: 7,
    automatic_thought: "Я не справляюсь. Меня уволят.",
    body_sensations: "Напряжение в плечах, учащённое сердцебиение",
    behavior: "Молчал на совещании, избегал зрительного контакта",
    evidence_supporting: "Начальник действительно был недоволен",
    evidence_against: "До этого проекты я сдавал вовремя",
    alternative_thought: "Я допустил ошибки в планировании, но это не делает меня некомпетентным",
    new_emotion_intensity: 4,
    lessons_learned: "Нужно лучше коммуницировать о задержках заранее",
    mood: 3,
    energy: 5,
    stress: 7,
    anxiety: 8,
    tags: ["работа", "стресс"],
  },
  {
    id: "demo-2",
    user_id: "demo",
    created_at: "2026-06-18T21:15:00Z",
    situation: "Вечерняя прогулка в парке. Почувствовал себя расслабленным",
    emotion: "Спокойствие",
    emotion_intensity: 3,
    automatic_thought: "Мир спокоен, я могу расслабиться",
    body_sensations: "Лёгкость в теле, ровное дыхание",
    behavior: "Шёл медленно, любовался природой",
    evidence_supporting: "",
    evidence_against: "",
    alternative_thought: "",
    new_emotion_intensity: 2,
    lessons_learned: "Прогулки помогают снижать стресс",
    mood: 4,
    energy: 6,
    stress: 2,
    anxiety: 1,
    tags: ["природа", "отдых"],
  },
  {
    id: "demo-3",
    user_id: "demo",
    created_at: "2026-06-17T10:00:00Z",
    situation: "Получил положительный отзыв от клиента",
    emotion: "Радость",
    emotion_intensity: 8,
    automatic_thought: "Я справился! Мою работу ценят",
    body_sensations: "Лёгкость,.want to smile",
    behavior: "Поделился успехом с коллегами",
    evidence_supporting: "Клиент реально похвалил",
    evidence_against: "",
    alternative_thought: "",
    new_emotion_intensity: 3,
    lessons_learned: "Важно замечать позитивные отзывы",
    mood: 5,
    energy: 8,
    stress: 1,
    anxiety: 1,
    tags: ["работа", "успех"],
  },
]

export async function getJournalEntries(): Promise<JournalEntry[]> {
  if (isDemo()) return demoEntries

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getJournalEntry(id: string): Promise<JournalEntry | null> {
  if (isDemo()) return demoEntries.find((e) => e.id === id) ?? null

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function createJournalEntry(entry: Omit<JournalEntry, "id" | "created_at">): Promise<JournalEntry> {
  if (isDemo()) {
    const newEntry: JournalEntry = {
      ...entry,
      id: `demo-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    demoEntries.unshift(newEntry)
    return newEntry
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .insert(entry)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
  if (isDemo()) {
    const idx = demoEntries.findIndex((e) => e.id === id)
    if (idx !== -1) {
      demoEntries[idx] = { ...demoEntries[idx], ...updates }
      return demoEntries[idx]
    }
    throw new Error("Entry not found")
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteJournalEntry(id: string): Promise<void> {
  if (isDemo()) {
    const idx = demoEntries.findIndex((e) => e.id === id)
    if (idx !== -1) demoEntries.splice(idx, 1)
    return
  }

  const { error } = await supabase
    .from("journal_entries")
    .update({ is_deleted: true })
    .eq("id", id)

  if (error) throw error
}
