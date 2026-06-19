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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function escapeCSV(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

function entriesToCSV(entries: JournalEntry[]): string {
  const headers = [
    "ID",
    "Дата",
    "Ситуация",
    "Эмоция",
    "Интенсивность (до)",
    "Интенсивность (после)",
    "Автоматическая мысль",
    "Физические ощущения",
    "Поведение",
    "Доказательства за",
    "Доказательства против",
    "Альтернативная мысль",
    "Уроки",
    "Настроение",
    "Энергия",
    "Стресс",
    "Тревога",
    "Теги",
  ]

  const rows = entries.map((e) => [
    e.id,
    formatDate(e.created_at),
    escapeCSV(e.situation),
    e.emotion,
    String(e.emotion_intensity),
    String(e.new_emotion_intensity),
    escapeCSV(e.automatic_thought),
    escapeCSV(e.body_sensations),
    escapeCSV(e.behavior),
    escapeCSV(e.evidence_supporting),
    escapeCSV(e.evidence_against),
    escapeCSV(e.alternative_thought),
    escapeCSV(e.lessons_learned),
    String(e.mood),
    String(e.energy),
    String(e.stress),
    String(e.anxiety),
    escapeCSV(e.tags.join("; ")),
  ])

  return "\uFEFF" + headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n")
}

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") || "csv"

  const supabase = await createClient()
  let entries: JournalEntry[]

  if (supabase) {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
    entries = data ?? []
  } else {
    entries = demoEntries
  }

  if (format === "json") {
    return NextResponse.json({
      exportDate: new Date().toISOString(),
      entries,
    })
  }

  const csv = entriesToCSV(entries)
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cbt-os-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
