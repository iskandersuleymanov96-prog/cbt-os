import { createClient } from "@/lib/supabase/client"
import type { Distortion } from "@/types"

const supabase = createClient()

function isDemo() {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL
}

const demoDistortions: Distortion[] = [
  { id: "1", name: "Катастрофизация", slug: "catastrophizing", description: "Преувеличение негативных последствий", examples: ["Если я опоздаю, меня уволят"], how_to_challenge: "Спросите: «Что самое худшее может произойти?»", icon: "🌪️" },
  { id: "2", name: "Чтение мыслей", slug: "mind-reading", description: "Убеждённость в том, что другие думают негативно", examples: ["Он точно думает, что я некомпетентен"], how_to_challenge: "Проверьте факты, спросите человека", icon: "🔮" },
  { id: "3", name: "Чёрно-белое мышление", slug: "black-and-white", description: "Видение только двух极端", examples: ["Если не идеально — провал"], how_to_challenge: "Найдите третий вариант", icon: "⬛" },
  { id: "4", name: "Обобщение", slug: "overgeneralization", description: "Один случай = всегда", examples: ["Я всегда всё порчу"], how_to_challenge: "Замените «всегда» на «иногда»", icon: "🔄" },
  { id: "5", name: "Эмоциональное рассуждение", slug: "emotional-reasoning", description: "Чувства = факты", examples: ["Мне страшно — значит опасность реальна"], how_to_challenge: "Чувства — это не факты", icon: "💭" },
  { id: "6", name: "Персонализация", slug: "personalization", description: "Брать вину на себя", examples: ["Коллега расстроен — это из-за меня"], how_to_challenge: "Какие ещё факторы повлияли?", icon: "🎯" },
  { id: "7", name: "Обесценивание позитива", slug: "discounting-positives", description: "Игнорирование хорошего", examples: ["Похвала — просто вежливость"], how_to_challenge: "Запишите 3 вещи, которые прошли хорошо", icon: "🚫" },
  { id: "8", name: "Долженствование", slug: "should-statements", description: "Жёсткие правила «я должен»", examples: ["Я должен всегда быть продуктивным"], how_to_challenge: "Замените «должен» на «хочу»", icon: "⚖️" },
  { id: "9", name: "Маркировка", slug: "labeling", description: "Навешивание ярлыков", examples: ["Я — неудачник"], how_to_challenge: "Опишите ситуацию без ярлыков", icon: "🏷️" },
  { id: "10", name: "Предсказание будущего", slug: "fortune-telling", description: "Предвидение негатива", examples: ["У меня точно не получится"], how_to_challenge: "Какова реальная вероятность?", icon: "🔮" },
]

export async function getDistortions(): Promise<Distortion[]> {
  if (isDemo()) return demoDistortions

  const { data, error } = await supabase
    .from("distortions")
    .select("*")
    .order("name")

  if (error) throw error
  return data ?? []
}

export async function getDistortionBySlug(slug: string): Promise<Distortion | null> {
  if (isDemo()) return demoDistortions.find((d) => d.slug === slug) ?? null

  const { data, error } = await supabase
    .from("distortions")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) throw error
  return data
}
