import { createClient } from "@/lib/supabase/client"
import type { Exercise } from "@/types"

const supabase = createClient()

function isDemo() {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL
}

const demoExercises: Exercise[] = [
  { id: "1", name: "Вызов мыслей", category: "КПТ", description: "Практика оспаривания автоматических негативных мыслей", steps: ["Запишите автоматическую мысль", "Найдите доказательства против", "Сформулируйте альтернативу", "Оцените новую интенсивность"], duration: 15, difficulty: "medium", icon: "🧠" },
  { id: "2", name: "Тестирование доказательств", category: "КПТ", description: "Проверка фактов для оценки реальности мыслей", steps: ["Запишите убеждение", "Найдите факты за", "Найдите факты против", "Сделайте вывод"], duration: 10, difficulty: "easy", icon: "⚖️" },
  { id: "3", name: "Смена перспективы", category: "КПТ", description: "Посмотрите на ситуацию глазами другого человека", steps: ["Опишите ситуацию", "Посмотрите глазами друга", "Посмотрите глазами нейтрального наблюдателя", "Найдите новый взгляд"], duration: 12, difficulty: "medium", icon: "🔄" },
  { id: "4", name: "Эксперимент с поведением", category: "КПТ", description: "Запланируйте поведенческий эксперимент", steps: ["Определите предсказание", "Спланируйте эксперимент", "Проведите эксперимент", "Проанализируйте результат"], duration: 20, difficulty: "hard", icon: "🧪" },
  { id: "5", name: "Заземление 5-4-3-2-1", category: "Осознанность", description: "Техника для снижения тревожности", steps: ["5 вещей, которые видите", "4 вещи, которые можете потрогать", "3 звука, которые слышите", "2 запаха", "1 вкус"], duration: 5, difficulty: "easy", icon: "🌿" },
  { id: "6", name: "Дыхание 4-7-8", category: "Дыхание", description: "Техника расслабляющего дыхания", steps: ["Вдох на 4 счёта", "Задержка на 7 счётов", "Выдох на 8 счётов", "Повторите 4 раза"], duration: 5, difficulty: "easy", icon: "🌬️" },
  { id: "7", name: "Самосострадание", category: "Самосострадание", description: "Практика доброты к себе", steps: ["Признайте свою боль", "Помните: страдание — общечеловеческий опыт", "Будьте добры к себе", "Предложите себе поддержку"], duration: 10, difficulty: "medium", icon: "💝" },
  { id: "8", name: "Промпты для дневника", category: "Дневник", description: "Вопросы для глубокой саморефлексии", steps: ["За что я благодарен?", "Что было сложным?", "Что я хочу отпустить?", "Что я хочу развивать?"], duration: 15, difficulty: "easy", icon: "📝" },
  { id: "9", name: "Упражнение на рефлексию", category: "Рефлексия", description: "Анализ прошедшего дня", steps: ["Что произошло?", "Что я почувствовал?", "Что я узнал о себе?", "Что буду делать иначе?"], duration: 10, difficulty: "easy", icon: "🔍" },
]

export async function getExercises(): Promise<Exercise[]> {
  if (isDemo()) return demoExercises

  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("name")

  if (error) throw error
  return data ?? []
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  if (isDemo()) return demoExercises.find((e) => e.id === id) ?? null

  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}
