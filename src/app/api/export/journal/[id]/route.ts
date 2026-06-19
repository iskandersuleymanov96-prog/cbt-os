import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { JournalEntry } from "@/types"

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
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const format = request.nextUrl.searchParams.get("format") || "pdf"

  const supabase = await createClient()
  let entry: JournalEntry | null = null

  if (supabase) {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("id", id)
      .single()
    entry = data
  } else {
    entry = demoEntries.find((e) => e.id === id) ?? null
  }

  if (!entry) {
    return NextResponse.json({ error: "Запись не найдена" }, { status: 404 })
  }

  if (format === "json") {
    return NextResponse.json(entry)
  }

  return NextResponse.json({ entry, format })
}
