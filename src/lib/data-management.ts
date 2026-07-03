import type { JournalEntry } from "@/types"

export function exportAsJSON(entries: JournalEntry[]): string {
  return JSON.stringify(
    { version: 1, exported_at: new Date().toISOString(), entries },
    null,
    2
  )
}

export function importFromJSON(json: string): { entries: JournalEntry[]; errors: string[] } {
  const errors: string[] = []
  try {
    const data = JSON.parse(json)
    if (!data.entries || !Array.isArray(data.entries)) {
      errors.push("Неверный формат: отсутствует массив entries")
      return { entries: [], errors }
    }
    const entries: JournalEntry[] = []
    data.entries.forEach((entry: Record<string, unknown>, i: number) => {
      const missing = REQUIRED_FIELDS.filter((f) => !entry[f])
      if (missing.length > 0) {
        errors.push(`Запись ${i + 1}: отсутствуют поля ${missing.join(", ")}`)
        return
      }
      entries.push({
        id: entry.id as string,
        user_id: (entry.user_id as string) || "local",
        created_at: (entry.created_at as string) || new Date().toISOString(),
        situation: entry.situation as string,
        emotion: entry.emotion as string,
        emotion_intensity: Number(entry.emotion_intensity) || 5,
        automatic_thought: (entry.automatic_thought as string) || "",
        body_sensations: (entry.body_sensations as string) || "",
        behavior: (entry.behavior as string) || "",
        evidence_supporting: (entry.evidence_supporting as string) || "",
        evidence_against: (entry.evidence_against as string) || "",
        alternative_thought: (entry.alternative_thought as string) || "",
        new_emotion_intensity: Number(entry.new_emotion_intensity) || 5,
        lessons_learned: (entry.lessons_learned as string) || "",
        mood: Number(entry.mood) || 3,
        energy: Number(entry.energy) || 3,
        stress: Number(entry.stress) || 5,
        anxiety: Number(entry.anxiety) || 5,
        tags: Array.isArray(entry.tags) ? (entry.tags as string[]) : [],
      })
    })
    return { entries, errors }
  } catch {
    errors.push("Невалидный JSON. Убедитесь, что файл не повреждён.")
    return { entries: [], errors }
  }
}

export function exportAsCSV(entries: JournalEntry[]): string {
  const headers = [
    "id", "created_at", "situation", "emotion", "emotion_intensity",
    "automatic_thought", "body_sensations", "behavior", "evidence_supporting",
    "evidence_against", "alternative_thought", "new_emotion_intensity",
    "lessons_learned", "mood", "energy", "stress", "anxiety", "tags",
  ]
  const rows = entries.map((e) =>
    headers
      .map((h) => {
        const val = (e as unknown as Record<string, unknown>)[h]
        const str = h === "tags" ? (val as string[]).join(";") : String(val ?? "")
        return csvEscape(str)
      })
      .join(",")
  )
  return "\uFEFF" + headers.join(",") + "\n" + rows.join("\n")
}

function csvEscape(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n") || val.includes("\r")) {
    return '"' + val.replace(/"/g, '""') + '"'
  }
  return val
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ",") {
        result.push(current)
        current = ""
      } else {
        current += ch
      }
    }
  }
  result.push(current)
  return result
}

export function importFromCSV(csv: string): { entries: JournalEntry[]; errors: string[] } {
  const errors: string[] = []
  const lines = csv.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) {
    errors.push("CSV файл пуст или содержит только заголовки")
    return { entries: [], errors }
  }

  const headerLine = lines[0].replace(/^\uFEFF/, "")
  const headers = parseCSVLine(headerLine).map((h) => h.trim())
  const requiredHeaders = ["id", "created_at", "situation", "emotion", "mood"]
  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))
  if (missingHeaders.length > 0) {
    errors.push(`Отсутствуют обязательные столбцы: ${missingHeaders.join(", ")}`)
    return { entries: [], errors }
  }

  const getIdx = (name: string) => headers.indexOf(name)

  const entries: JournalEntry[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length < headers.length) {
      errors.push(`Строка ${i + 1}: недостаточно столбцов`)
      continue
    }
    try {
      const tagsStr = getIdx("tags") >= 0 ? values[getIdx("tags")] : ""
      entries.push({
        id: values[getIdx("id")],
        user_id: "local",
        created_at: values[getIdx("created_at")] || new Date().toISOString(),
        situation: values[getIdx("situation")] || "",
        emotion: values[getIdx("emotion")] || "",
        emotion_intensity: parseInt(values[getIdx("emotion_intensity")] || "5", 10),
        automatic_thought: values[getIdx("automatic_thought")] || "",
        body_sensations: values[getIdx("body_sensations")] || "",
        behavior: values[getIdx("behavior")] || "",
        evidence_supporting: values[getIdx("evidence_supporting")] || "",
        evidence_against: values[getIdx("evidence_against")] || "",
        alternative_thought: values[getIdx("alternative_thought")] || "",
        new_emotion_intensity: parseInt(values[getIdx("new_emotion_intensity")] || "5", 10),
        lessons_learned: values[getIdx("lessons_learned")] || "",
        mood: parseInt(values[getIdx("mood")] || "3", 10),
        energy: parseInt(values[getIdx("energy")] || "3", 10),
        stress: parseInt(values[getIdx("stress")] || "5", 10),
        anxiety: parseInt(values[getIdx("anxiety")] || "5", 10),
        tags: tagsStr ? tagsStr.split(";").map((t) => t.trim()).filter(Boolean) : [],
      })
    } catch {
      errors.push(`Строка ${i + 1}: ошибка парсинга`)
    }
  }
  return { entries, errors }
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const REQUIRED_FIELDS = [
  "id", "created_at", "situation", "emotion", "mood",
]
