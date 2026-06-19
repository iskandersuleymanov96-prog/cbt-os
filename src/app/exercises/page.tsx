"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SkeletonCard } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { getExercises } from "@/lib/db/exercises"
import type { Exercise } from "@/types"

const difficultyLabels: Record<string, string> = {
  easy: "Легко",
  medium: "Средне",
  hard: "Сложно",
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("Все")
  const [activeExercise, setActiveExercise] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    getExercises().then((data) => {
      setExercises(data)
      setLoading(false)
    })
  }, [])

  const categories = ["Все", ...new Set(exercises.map((e) => e.category))]
  const filtered = activeCategory === "Все" ? exercises : exercises.filter((e) => e.category === activeCategory)
  const selected = exercises.find((e) => e.id === activeExercise)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-deep-charcoal">Упражнения</h1>
          <p className="text-muted-foreground">Практики для развития осознанности</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (selected) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => { setActiveExercise(null); setCurrentStep(0); }}>
          ← Назад к упражнениям
        </Button>

        <div className="text-center">
          <motion.span
            className="text-5xl mb-4 block"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            {selected.icon}
          </motion.span>
          <h2 className="text-2xl font-bold text-deep-charcoal">{selected.name}</h2>
          <p className="text-muted-foreground mt-1">{selected.description}</p>
          <div className="flex justify-center gap-2 mt-3">
            <Badge variant="outline">{selected.category}</Badge>
            <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{selected.duration} мин</Badge>
            <Badge className={difficultyColors[selected.difficulty]}>{difficultyLabels[selected.difficulty]}</Badge>
          </div>
        </div>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="space-y-4">
              {selected.steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                    i === currentStep ? "bg-primary/10 ring-2 ring-primary" : i < currentStep ? "bg-green-50 opacity-60" : "bg-secondary/50"
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    i < currentStep ? "bg-green-500 text-white" : i === currentStep ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                    {i < currentStep ? "✓" : i + 1}
                  </div>
                  <p className={`text-sm flex-1 ${i === currentStep ? "font-medium" : ""}`}>{step}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentStep((s) => Math.max(0, s - 1))} disabled={currentStep === 0}>
            Предыдущий
          </Button>
          {currentStep < selected.steps.length - 1 ? (
            <Button onClick={() => setCurrentStep((s) => s + 1)} className="flex-1 gradient-primary text-white">
              Следующий шаг
            </Button>
          ) : (
            <Button onClick={() => { setActiveExercise(null); setCurrentStep(0); }} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              Завершить упражнение
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-deep-charcoal">Упражнения</h1>
          <p className="text-muted-foreground">Практики для развития осознанности</p>
        </div>
        <EmptyState
          icon="🧘"
          title="Упражнения скоро появятся"
          description="Мы готовим для вас коллекцию практик для развития осознанности и управления стрессом."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-deep-charcoal">Упражнения</h1>
        <p className="text-muted-foreground">Практики для развития осознанности</p>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((exercise, i) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Card
                  className="glass-card transition-all hover:-translate-y-0.5 hover:card-shadow-hover cursor-pointer"
                  onClick={() => setActiveExercise(exercise.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{exercise.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-deep-charcoal">{exercise.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{exercise.category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{exercise.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        <Clock className="h-3 w-3 mr-1" />{exercise.duration} мин
                      </Badge>
                      <Badge className={`${difficultyColors[exercise.difficulty]} text-[10px]`}>
                        {difficultyLabels[exercise.difficulty]}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
