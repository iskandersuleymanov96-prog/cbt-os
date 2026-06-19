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
