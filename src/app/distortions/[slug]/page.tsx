"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lightbulb, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const distortions: Record<string, {
  name: string
  icon: string
  description: string
  frequency: number
  examples: string[]
  challenge: string
}> = {
  catastrophizing: {
    name: "Катастрофизация",
    icon: "🌪️",
    description: "Преувеличение негативных последствий событий. Вы видите только худший возможный сценарий и считаете его наиболее вероятным.",
    frequency: 12,
    examples: [
      "Если я опоздаю на совещание, меня уволят",
      "Эта ошибка разрушит весь проект",
      "Если она не ответит на сообщение — всё кончено",
      "Малейшая ошибка в коде сломает всё приложение",
    ],
    challenge: "Спросите себя: «Что самое худшее может произойти? Какова реальная вероятность этого? Что я сделаю, если это случится?» Часто оказывается, что самое худшее маловероятно, а вы справитесь даже с ним.",
  },
  "mind-reading": {
    name: "Чтение мыслей",
    icon: "🔮",
    description: "Убеждённость в том, что другие думают о вас негативно, без реальных доказательств.",
    frequency: 9,
    examples: [
      "Он точно думает, что я некомпетентен",
      "Они все замечают, как я волнуюсь",
      "Начальник недоволен моей работой",
    ],
    challenge: "Проверьте факты: есть ли реальные доказательства? Вы знаете, что на самом деле думает другой человек? Спросите его напрямую.",
  },
  "black-and-white": {
    name: "Чёрно-белое мышление",
    icon: "⚫",
    description: "Восприятие мира в крайностях: всё хорошо или всё плохо, без промежуточных оттенков.",
    frequency: 7,
    examples: [
      "Если я не идеален — я полный неудачник",
      "Либо проект будет идеальным, либо его не стоит начинать",
      "Он либо со мной, либо против меня",
    ],
    challenge: "Ищите серые зоны. Где между «идеально» и «ужасно» находится реальность? Что было бы «достаточно хорошо»?",
  },
  overgeneralization: {
    name: "Генерализация",
    icon: "🔄",
    description: "Вывод о чём-то на основании одного или двух случаев. Слова «всегда», «никогда», «все», «никто».",
    frequency: 8,
    examples: [
      "Я всегда всё порчу",
      "Никто меня не понимает",
      "У меня никогда не получается",
    ],
    challenge: "Замените абсолютные слова на конкретные факты. Когда именно это произошло? Сколько раз на самом деле?",
  },
  "emotional-reasoning": {
    name: "Эмоциональное обоснование",
    icon: "💭",
    description: "Убеждение, что если вы чувствуете что-то — значит, это правда. «Я чувствую себя глупым, значит, я глупый».",
    frequency: 6,
    examples: [
      "Я чувствую тревогу — значит, что-то плохое обязательно случится",
      "Я чувствую себя виноватым — значит, я действительно виноват",
      "Я чувствую, что не справлюсь — значит, это невозможно",
    ],
    challenge: "Эмоции — это не факты. Спросите: «Что говорят факты? Есть ли объективные доказательства?»",
  },
  personalization: {
    name: "Персонализация",
    icon: "🎯",
    description: "Склонность брать на себя ответственность за вещи, которые не в вашем контроле.",
    frequency: 5,
    examples: [
      "Ребёнок получил плохую оценку — я плохой родитель",
      "Коллега в плохом настроении — я что-то сделал не так",
      "Проект провалился — это моя вина",
    ],
    challenge: "Спросите: «Что из этого действительно в моём контроле? Какие другие факторы могли повлиять?»",
  },
  "discounting-positives": {
    name: "Обесценивание позитивного",
    icon: "🚫",
    description: "Отбрасывание положительного опыта, достижений и комплиментов как «незначительных» или «случайных».",
    frequency: 10,
    examples: [
      "Этот успех — просто везение",
      "Комплимент — они просто вежливы",
      "Хорошая оценка не считается, задание было лёгким",
    ],
    challenge: "Записывайте достижения и принимайте комплименты. Спросите: «Если бы друг рассказал мне об этом — я бы обесценил его успех?»",
  },
  "should-statements": {
    name: "Долженствование",
    icon: "📋",
    description: "Жёсткие правила о том, как «должно» быть. «Я должен», «Они должны», «Мир должен».",
    frequency: 11,
    examples: [
      "Я должен всегда быть продуктивным",
      "Они должны уважать моё мнение",
      "Я не должен ошибаться",
    ],
    challenge: "Замените «должен» на «хотел бы» или «предпочту». Это снижает давление и открывает гибкость.",
  },
  labeling: {
    name: "Навешивание ярлыков",
    icon: "🏷️",
    description: "Приклеивание себе или другим глобальных ярлыков на основании одного события.",
    frequency: 4,
    examples: [
      "Я неудачник (вместо: я допустил ошибку)",
      "Он自私 (вместо: он поступил自私 в этой ситуации)",
      "Я глупый (вместо: я не понял эту тему)",
    ],
    challenge: "Описывайте поведение, а не личность. «Я совершил ошибку» вместо «Я неудачник».",
  },
  "fortune-telling": {
    name: "Предсказание будущего",
    icon: "🔮",
    description: "Уверенность в том, что вы знаете, что произойдёт — обычно негативное.",
    frequency: 6,
    examples: [
      "Я точно провалю собеседование",
      "Этот день будет ужасным",
      "У меня никогда не получится это сделать",
    ],
    challenge: "Спросите: «Откуда я это знаю? Какие у меня доказательства? Сколько раз мои негативные предсказания сбывались?»",
  },
}

const fallbackDistortion = {
  name: "Искажение",
  icon: "❓",
  description: "Описание искажения",
  frequency: 0,
  examples: [],
  challenge: "",
}

export default function DistortionDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const distortion = distortions[slug] || { ...fallbackDistortion, name: slug, slug }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/distortions">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Ко всем искажениям
        </Button>
      </Link>

      <div className="flex items-start gap-4">
        <span className="text-5xl">{distortion.icon}</span>
        <div>
          <h1 className="text-2xl font-bold text-deep-charcoal">{distortion.name}</h1>
          <p className="text-muted-foreground mt-1">{distortion.description}</p>
          <Badge variant="secondary" className="mt-2">
            Встречалось {distortion.frequency} раз
          </Badge>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Примеры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {distortion.examples.map((example, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <span className="text-muted-foreground italic">&ldquo;{example}&rdquo;</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Как оспаривать
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {distortion.challenge}
          </p>
        </CardContent>
      </Card>

      <Link href="/journal/new">
        <Button className="w-full gap-2">
          <BookOpen className="h-4 w-4" />
          Начать запись с этим искажением
        </Button>
      </Link>
    </div>
  )
}
