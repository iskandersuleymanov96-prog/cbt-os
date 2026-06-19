import type { JournalEntry } from "@/types"

const ENTRY_FIELDS = [
  { key: "situation", label: "Ситуация" },
  { key: "automatic_thought", label: "Автоматическая мысль" },
  { key: "body_sensations", label: "Физические ощущения" },
  { key: "behavior", label: "Поведение" },
  { key: "evidence_supporting", label: "Доказательства ЗА" },
  { key: "evidence_against", label: "Доказательства ПРОТИВ" },
  { key: "alternative_thought", label: "Альтернативная мысль" },
  { key: "lessons_learned", label: "Уроки и выводы" },
] as const

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getFieldValue(entry: JournalEntry, key: string): string {
  const e = entry as unknown as Record<string, unknown>
  const val = e[key]
  if (!val || val === "") return ""
  return String(val)
}

function buildEntryHTML(entry: JournalEntry): string {
  const fields = ENTRY_FIELDS
    .map(({ key, label }) => {
      const value = getFieldValue(entry, key)
      if (!value) return ""
      return `
        <div class="field">
          <div class="field-label">${label}</div>
          <div class="field-value">${value.replace(/\n/g, "<br>")}</div>
        </div>`
    })
    .filter(Boolean)
    .join("")

  const intensityChange = entry.emotion_intensity - entry.new_emotion_intensity

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1a1a2e;
    padding: 40px;
    line-height: 1.6;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #6c5ce7;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .brand {
    font-size: 22px;
    font-weight: 700;
    color: #6c5ce7;
  }
  .brand-sub {
    font-size: 12px;
    color: #8b8fa3;
    margin-top: 2px;
  }
  .date {
    font-size: 13px;
    color: #6b7280;
    text-align: right;
  }
  .meta-bar {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
    font-size: 13px;
    color: #4b5563;
  }
  .meta-item { display: flex; align-items: center; gap: 6px; }
  .meta-label { font-weight: 600; }
  .intensity-row {
    display: flex;
    align-items: center;
    gap: 24px;
    background: #f0f0ff;
    border-radius: 8px;
    padding: 12px 20px;
    margin-bottom: 24px;
    font-size: 14px;
  }
  .intensity-box { text-align: center; }
  .intensity-box .label { font-size: 11px; color: #6b7280; text-transform: uppercase; }
  .intensity-box .value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
  .intensity-arrow { font-size: 20px; color: #6c5ce7; }
  .badge {
    display: inline-block;
    background: ${intensityChange > 0 ? "#dcfce7" : intensityChange < 0 ? "#fef2f2" : "#f3f4f6"};
    color: ${intensityChange > 0 ? "#166534" : intensityChange < 0 ? "#991b1b" : "#374151"};
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    margin-left: auto;
  }
  .tags { display: flex; gap: 6px; margin-bottom: 20px; }
  .tag {
    background: #e8e8f0;
    color: #4b5563;
    padding: 2px 10px;
    border-radius: 10px;
    font-size: 12px;
  }
  .field {
    margin-bottom: 16px;
    page-break-inside: avoid;
  }
  .field-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #6c5ce7;
    margin-bottom: 4px;
  }
  .field-value {
    font-size: 14px;
    color: #374151;
    line-height: 1.7;
  }
  .field-value.italic { font-style: italic; }
  .divider {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 16px 0;
  }
  .metrics {
    display: flex;
    gap: 32px;
    margin-bottom: 24px;
    padding: 12px 20px;
    background: #fafafa;
    border-radius: 8px;
    font-size: 13px;
  }
  .metric { display: flex; flex-direction: column; }
  .metric .label { font-size: 11px; color: #6b7280; }
  .metric .value { font-weight: 700; color: #1a1a2e; }
  .footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    font-size: 11px;
    color: #9ca3af;
    text-align: center;
  }
  @media print {
    body { padding: 20px; }
  }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">CBT OS</div>
      <div class="brand-sub">Когнитивно-поведенческая терапия</div>
    </div>
    <div class="date">${formatDate(entry.created_at)}</div>
  </div>

  <div class="meta-bar">
    <div class="meta-item">
      <span class="meta-label">Эмоция:</span>
      <span>${entry.emotion}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Интенсивность:</span>
      <span>${entry.emotion_intensity}/10</span>
    </div>
  </div>

  <div class="intensity-row">
    <div class="intensity-box">
      <div class="label">Было</div>
      <div class="value">${entry.emotion_intensity}</div>
    </div>
    <div class="intensity-arrow">→</div>
    <div class="intensity-box">
      <div class="label">Стало</div>
      <div class="value">${entry.new_emotion_intensity}</div>
    </div>
    ${intensityChange > 0 ? `<span class="badge">Снижение на ${intensityChange}</span>` : ""}
  </div>

  <div class="tags">
    ${entry.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
  </div>

  ${fields}

  <hr class="divider">

  <div class="metrics">
    <div class="metric">
      <span class="label">Настроение</span>
      <span class="value">${entry.mood}/5</span>
    </div>
    <div class="metric">
      <span class="label">Энергия</span>
      <span class="value">${entry.energy}/10</span>
    </div>
    <div class="metric">
      <span class="label">Стресс</span>
      <span class="value">${entry.stress}/10</span>
    </div>
    <div class="metric">
      <span class="label">Тревога</span>
      <span class="value">${entry.anxiety}/10</span>
    </div>
  </div>

  <div class="footer">
    CBT OS — Когнитивно-поведенческая терапия • Экспорт ${new Date().toLocaleDateString("ru-RU")}
  </div>
</body>
</html>`
}

function buildMultiEntryHTML(entries: JournalEntry[]): string {
  const rows = entries
    .map(
      (e) => `
    <tr>
      <td>${formatDate(e.created_at)}</td>
      <td>${e.situation.slice(0, 80)}${e.situation.length > 80 ? "…" : ""}</td>
      <td>${e.emotion}</td>
      <td>${e.emotion_intensity}</td>
      <td>${e.new_emotion_intensity}</td>
      <td>${e.automatic_thought.slice(0, 60)}${e.automatic_thought.length > 60 ? "…" : ""}</td>
      <td>${e.tags.join(", ")}</td>
    </tr>`
    )
    .join("")

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1a1a2e;
    padding: 40px;
    line-height: 1.5;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #6c5ce7;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .brand { font-size: 22px; font-weight: 700; color: #6c5ce7; }
  .brand-sub { font-size: 12px; color: #8b8fa3; margin-top: 2px; }
  .date { font-size: 13px; color: #6b7280; text-align: right; }
  .summary { margin-bottom: 20px; font-size: 14px; color: #4b5563; }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin-bottom: 24px;
  }
  th {
    background: #6c5ce7;
    color: white;
    padding: 8px 10px;
    text-align: left;
    font-weight: 600;
  }
  td {
    padding: 8px 10px;
    border-bottom: 1px solid #e5e7eb;
  }
  tr:nth-child(even) td { background: #f9fafb; }
  .footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    font-size: 11px;
    color: #9ca3af;
    text-align: center;
  }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">CBT OS</div>
      <div class="brand-sub">Когнитивно-поведенческая терапия — Все записи</div>
    </div>
    <div class="date">${new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</div>
  </div>
  <div class="summary">Всего записей: <strong>${entries.length}</strong></div>
  <table>
    <thead>
      <tr>
        <th>Дата</th>
        <th>Ситуация</th>
        <th>Эмоция</th>
        <th>Было</th>
        <th>Стало</th>
        <th>Мысль</th>
        <th>Теги</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    CBT OS — Когнитивно-поведенческая терапия • Экспорт ${new Date().toLocaleDateString("ru-RU")}
  </div>
</body>
</html>`
}

export async function generateEntryPDF(entry: JournalEntry): Promise<Blob> {
  const html2pdf = (await import("html2pdf.js")).default

  const container = document.createElement("div")
  container.innerHTML = buildEntryHTML(entry)
  container.style.position = "fixed"
  container.style.left = "-9999px"
  container.style.top = "0"
  container.style.width = "794px"
  document.body.appendChild(container)

  const pdf = await html2pdf()
    .set({
      margin: 0,
      filename: `cbt-os-entry-${entry.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(container)
    .outputPdf("blob")

  document.body.removeChild(container)
  return pdf as Blob
}

export async function generateAllEntriesPDF(entries: JournalEntry[]): Promise<Blob> {
  const html2pdf = (await import("html2pdf.js")).default

  const container = document.createElement("div")
  container.innerHTML = buildMultiEntryHTML(entries)
  container.style.position = "fixed"
  container.style.left = "-9999px"
  container.style.top = "0"
  container.style.width = "794px"
  document.body.appendChild(container)

  const pdf = await html2pdf()
    .set({
      margin: 0,
      filename: `cbt-os-all-entries-${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    })
    .from(container)
    .outputPdf("blob")

  document.body.removeChild(container)
  return pdf as Blob
}

export function generateCSV(entries: JournalEntry[]): string {
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

  const escapeCSV = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`
    }
    return val
  }

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

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadText(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  downloadBlob(blob, filename)
}
