import type { JournalEntry, AIInsight } from "@/types"
import { analyzeEntries, calculateTriggerScore, calculateDistortionScore, calculateGrowthScore } from "./pattern-engine"

export type InsightType = "pattern" | "suggestion" | "reflection" | "growth"

interface InsightCandidate {
  type: InsightType
  title: string
  content: string
  confidence: number
  dataPoints: number
}

let insightCounter = 0

function generateId(): string {
  insightCounter++
  return `insight-${Date.now()}-${insightCounter}`
}

export function generateInsight(entries: JournalEntry[], type: InsightType): AIInsight | null {
  if (entries.length < 2) return null

  const analysis = analyzeEntries(entries)
  const candidates: InsightCandidate[] = []

  if (type === "pattern") {
    // Pattern insights: recurring emotions, thoughts, distortions
    const recurringEmotions = analysis.thoughtPatterns.filter((p) => p.type === "recurring_emotion")
    for (const pattern of recurringEmotions) {
      candidates.push({
        type: "pattern",
        title: `Повторяющаяся эмоция: ${pattern.description.split(":")[0] ?? pattern.description}`,
        content: `Эмоция повторяется ${pattern.frequency} раз. Это может указывать на устойчивый когнитивный паттерн. Попробуйте проследить, какие ситуации вызывают эту эмоцию.`,
        confidence: Math.min(90, 40 + pattern.frequency * 10),
        dataPoints: pattern.frequency,
      })
    }

    const distortions = analysis.thoughtPatterns.filter((p) => p.type === "cognitive_distortion")
    for (const pattern of distortions) {
      candidates.push({
        type: "pattern",
        title: `Когнитивное искажение: ${pattern.description.split(":")[0] ?? pattern.description}`,
        content: `Искажение обнаружено ${pattern.frequency} раз. Рассмотрите возможность применения техники оспаривания для этого типа мышления.`,
        confidence: Math.min(85, 35 + pattern.frequency * 12),
        dataPoints: pattern.frequency,
      })
    }

    const recurringTags = analysis.thoughtPatterns.filter((p) => p.type === "recurring_situation")
    for (const pattern of recurringTags) {
      candidates.push({
        type: "pattern",
        title: `Триггер: ${pattern.description.split(":")[0] ?? pattern.description}`,
        content: `Тема «${pattern.description}» повторяется ${pattern.frequency} раз. Это может быть ключевым триггером для ваших эмоциональных реакций.`,
        confidence: Math.min(80, 30 + pattern.frequency * 10),
        dataPoints: pattern.frequency,
      })
    }
  }

  if (type === "suggestion") {
    const distortionScore = calculateDistortionScore(entries)
    const triggerScore = calculateTriggerScore(entries)

    if (distortionScore > 50 && analysis.distortions.length > 0) {
      const topDistortion = analysis.distortions[0]
      candidates.push({
        type: "suggestion",
        title: "Рекомендация: работа с искажениями",
        content: `Обнаружено высокое количество когнитивных искажений (${distortionScore}/100). Основное: «${topDistortion.name}». Попробуйте технику «Доказательства за и против» для оспаривания этих мыслей.`,
        confidence: Math.min(85, distortionScore),
        dataPoints: analysis.distortions.length,
      })
    }

    if (triggerScore > 40 && analysis.triggerAnalysis.topTags.length > 0) {
      const topTrigger = analysis.triggerAnalysis.topTags[0]
      candidates.push({
        type: "suggestion",
        title: "Рекомендация: управление триггерами",
        content: `Тема «${topTrigger.tag}» является частым триггером (${topTrigger.count} раз). Попробуйте технику осознанного дыхания перед ситуациями, связанными с этим триггером.`,
        confidence: Math.min(75, triggerScore),
        dataPoints: topTrigger.count,
      })
    }

    if (analysis.emotionProfile.intensityTrend === "worsening") {
      candidates.push({
        type: "suggestion",
        title: "Рекомендация: снижение эмоциональной нагрузки",
        content: "Интенсивность эмоций возрастает. Рекомендуется добавить техники саморегуляции: дыхательные упражнения, прогрессивная мышечная релаксация или заземление.",
        confidence: 70,
        dataPoints: entries.length,
      })
    }

    const withAlt = entries.filter((e) => e.alternative_thought && e.alternative_thought.length > 10).length
    if (withAlt < entries.length * 0.3) {
      candidates.push({
        type: "suggestion",
        title: "Рекомендация: больше альтернативных мыслей",
        content: `Альтернативные мысли найдены только в ${Math.round((withAlt / entries.length) * 100)}% записей. Попробуйте в каждой записи задать вопрос: «Как я могу посмотреть на это по-другому?»`,
        confidence: 65,
        dataPoints: entries.length,
      })
    }
  }

  if (type === "reflection") {
    const avgMood = entries.reduce((s, e) => s + e.mood, 0) / entries.length
    const avgStress = entries.reduce((s, e) => s + e.stress, 0) / entries.length

    candidates.push({
      type: "reflection",
      title: "Рефлексия: ваш эмоциональный ландшафт",
      content: `Среднее настроение: ${avgMood.toFixed(1)}, средний стресс: ${avgStress.toFixed(1)}. ${avgMood > avgStress ? "Настроение в целом выше стресса — это хороший баланс." : "Стресс преобладает над настроением — стоит обратить внимание на восстановление."}`,
      confidence: 80,
      dataPoints: entries.length,
    })

    if (analysis.growthIndicators.length > 0) {
      const bestGrowth = analysis.growthIndicators[0]
      candidates.push({
        type: "reflection",
        title: "Рефлексия: ваши сильные стороны",
        content: `${bestGrowth.description}. Это говорит о вашей способности к самонаблюдению и саморазвитию.`,
        confidence: Math.min(85, 50 + bestGrowth.magnitude),
        dataPoints: bestGrowth.magnitude,
      })
    }

    if (entries.length >= 3) {
      const sorted = [...entries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      const first = sorted[0]
      const last = sorted[sorted.length - 1]
      const moodChange = last.mood - first.mood
      const stressChange = last.stress - first.stress

      if (Math.abs(moodChange) >= 1 || Math.abs(stressChange) >= 1) {
        candidates.push({
          type: "reflection",
          title: "Рефлексия: динамика за период",
          content: `Настроение изменилось на ${moodChange > 0 ? "+" : ""}${moodChange}, стресс на ${stressChange > 0 ? "+" : ""}${stressChange}. ${moodChange > 0 ? "Позитивная динамика!" : moodChange < 0 ? "Есть тенденция к снижению настроения." : "Настроение стабильно."}`,
          confidence: 75,
          dataPoints: entries.length,
        })
      }
    }
  }

  if (type === "growth") {
    const growthScore = calculateGrowthScore(entries)

    if (growthScore > 50) {
      candidates.push({
        type: "growth",
        title: "Рост: высокий показатель",
        content: `Ваш показатель роста: ${growthScore}/100. Вы активно применяете техники КПТ и демонстрируете прогресс.`,
        confidence: growthScore,
        dataPoints: entries.length,
      })
    } else if (growthScore > 20) {
      candidates.push({
        type: "growth",
        title: "Рост: начальный прогресс",
        content: `Ваш показатель роста: ${growthScore}/100. Есть прогресс, но есть потенциал для усиления. Попробуйте чаще записывать альтернативные мысли и выводы.`,
        confidence: 70,
        dataPoints: entries.length,
      })
    }

    const withReduction = entries.filter((e) => e.emotion_intensity > e.new_emotion_intensity)
    if (withReduction.length >= 2) {
      const avgReduction = withReduction.reduce((s, e) => s + (e.emotion_intensity - e.new_emotion_intensity), 0) / withReduction.length
      candidates.push({
        type: "growth",
        title: "Рост: снижение интенсивности",
        content: `Вы снизили интенсивность эмоций в ${withReduction.length} записях в среднем на ${avgReduction.toFixed(1)} баллов. Это показывает развитие навыков эмоциональной регуляции.`,
        confidence: Math.min(85, 50 + withReduction.length * 5),
        dataPoints: withReduction.length,
      })
    }
  }

  if (candidates.length === 0) return null

  // Sort by confidence, pick the best
  candidates.sort((a, b) => b.confidence - a.confidence)
  const best = candidates[0]

  return {
    id: generateId(),
    user_id: entries[0].user_id,
    type: best.type,
    title: best.title,
    content: best.content,
    confidence: Math.round(best.confidence),
    created_at: new Date().toISOString(),
    is_read: false,
  }
}

export function generateAllInsights(entries: JournalEntry[]): AIInsight[] {
  if (entries.length < 2) return []

  const insights: AIInsight[] = []
  const types: InsightType[] = ["pattern", "suggestion", "reflection", "growth"]

  for (const type of types) {
    const insight = generateInsight(entries, type)
    if (insight) insights.push(insight)
  }

  return insights
}

export { calculatePatternScore, calculateTriggerScore, calculateDistortionScore, calculateGrowthScore } from "./pattern-engine"
