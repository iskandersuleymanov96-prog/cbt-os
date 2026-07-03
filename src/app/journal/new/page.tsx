"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Sparkles, Mic } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { GradientButton } from "@/components/ui/gradient-button"
import { SuccessToast } from "@/components/ui/success-toast"
import { useJournalStore } from "@/stores/journal"

const steps = [
  { title: "Ситуация", description: "Что произошло?" },
  { title: "Эмоции", description: "Что вы чувствуете?" },
  { title: "Автоматическая мысль", description: "Какая мысль пришла?" },
  { title: "Тело", description: "Что чувствовали в теле?" },
  { title: "Поведение", description: "Как отреагировали?" },
  { title: "Искажения", description: "Какие искажения заметили?" },
  { title: "Доказательства", description: "За и против мысли" },
  { title: "Альтернатива", description: "Другой взгляд" },
  { title: "Ре-оценка", description: "Как теперь?" },
  { title: "Итог", description: "Сохранение" },
]

const emotions = [
  { name: "Радость", icon: "😊", category: "positive" },
  { name: "Спокойствие", icon: "😌", category: "positive" },
  { name: "Удовлетворение", icon: "🙂", category: "positive" },
  { name: "Гордость", icon: "🥳", category: "positive" },
  { name: "Благодарность", icon: "🙏", category: "positive" },
  { name: "Тревога", icon: "😟", category: "negative" },
  { name: "Страх", icon: "😨", category: "negative" },
  { name: "Грусть", icon: "😢", category: "negative" },
  { name: "Злость", icon: "😠", category: "negative" },
  { name: "Вина", icon: "😔", category: "negative" },
  { name: "Стыд", icon: "😳", category: "negative" },
  { name: "Разочарование", icon: "😞", category: "negative" },
  { name: "Нейтрально", icon: "😐", category: "neutral" },
  { name: "Усталость", icon: "😩", category: "neutral" },
  { name: "Скука", icon: "🥱", category: "neutral" },
]

const distortions = [
  { name: "Катастрофизация", icon: "🌪️", description: "Преувеличение негативных последствий" },
  { name: "Чтение мыслей", icon: "🔮", description: "Убеждённость в том, что другие думают о вас" },
  { name: "Чёрно-белое мышление", icon: "⬛", description: "Видение только двух крайних" },
  { name: "Обобщение", icon: "🔄", description: "Один случай = всегда" },
  { name: "Эмоциональное рассуждение", icon: "💭", description: "Чувства = факты" },
  { name: "Персонализация", icon: "🎯", description: "Брать вину на себя" },
  { name: "Обесценивание позитива", icon: "🚫", description: "Игнорирование хорошего" },
  { name: "Долженствование", icon: "⚖️", description: "\"Я должен\" / \"Ты должен\"" },
  { name: "Маркировка", icon: "🏷️", description: "Навешивание ярлыков" },
  { name: "Предсказание будущего", icon: "🔮", description: "Предвидение негатива" },
]

const tags = ["работа", "отношения", "здоровье", "семья", "финансы", "учёба", "другое"]

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
}

function NewJournalEntryInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const addEntry = useJournalStore((s) => s.addEntry)
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [showSaved, setShowSaved] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)
  const [form, setForm] = useState({
    situation: searchParams.get("situation") || "",
    date: new Date().toISOString().slice(0, 16),
    tags: [] as string[],
    emotions: [] as string[],
    intensity: 5,
    automaticThought: "",
    bodySensations: "",
    behavior: "",
    distortions: [] as string[],
    evidenceFor: "",
    evidenceAgainst: "",
    alternativeThought: "",
    newIntensity: 5,
    lessonsLearned: "",
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cbt-os-journal-draft")
      if (saved) {
        const draft = JSON.parse(saved)
        setForm(draft.form)
        setCurrentStep(draft.step)
        setDraftRestored(true)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (!draftRestored) return
    const timer = setTimeout(() => setDraftRestored(false), 3000)
    return () => clearTimeout(timer)
  }, [draftRestored])

  useEffect(() => {
    localStorage.setItem("cbt-os-journal-draft", JSON.stringify({ form, step: currentStep }))
  }, [form, currentStep])

  const updateForm = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const toggleEmotion = (name: string) => {
    setForm((prev) => ({
      ...prev,
      emotions: prev.emotions.includes(name)
        ? prev.emotions.filter((e) => e !== name)
        : prev.emotions.length < 3
        ? [...prev.emotions, name]
        : prev.emotions,
    }))
  }

  const toggleDistortion = (name: string) => {
    setForm((prev) => ({
      ...prev,
      distortions: prev.distortions.includes(name)
        ? prev.distortions.filter((d) => d !== name)
        : [...prev.distortions, name],
    }))
  }

  const next = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1)
      setCurrentStep((s) => s + 1)
    }
  }
  const prev = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((s) => s - 1)
    }
  }

  const handleSave = () => {
    const entry = {
      id: crypto.randomUUID(),
      user_id: "demo",
      created_at: new Date().toISOString(),
      situation: form.situation,
      emotion: form.emotions[0] || "Нейтрально",
      emotion_intensity: form.intensity,
      automatic_thought: form.automaticThought,
      body_sensations: form.bodySensations,
      behavior: form.behavior,
      evidence_supporting: form.evidenceFor,
      evidence_against: form.evidenceAgainst,
      alternative_thought: form.alternativeThought,
      new_emotion_intensity: form.newIntensity,
      lessons_learned: form.lessonsLearned,
      mood: Math.round(form.newIntensity / 2),
      energy: 5,
      stress: form.intensity,
      anxiety: form.intensity,
      tags: form.tags,
    }
    addEntry(entry)
    localStorage.removeItem("cbt-os-journal-draft")
    setShowSaved(true)
    setTimeout(() => {
      router.push("/journal")
    }, 2000)
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Toast */}
      <SuccessToast
        show={showSaved}
        type="saved"
        title="Запись сохранена!"
        message="Отличная работа над осознанностью"
        onClose={() => setShowSaved(false)}
      />
      <SuccessToast
        show={draftRestored}
        type="info"
        title="Черновик восстановлен"
        message="Продолжайте с того места, где остановились"
        onClose={() => setDraftRestored(false)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
        <span className="text-sm text-muted-foreground">
          Шаг {currentStep + 1} из {steps.length}
        </span>
      </div>

      {/* Animated Progress */}
      <div className="space-y-2">
        <div className="relative h-2 overflow-hidden rounded-full bg-secondary/80">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full gradient-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="flex gap-1">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= currentStep ? "bg-primary" : "bg-secondary"
              }`}
              animate={{
                scaleX: i === currentStep ? 1.2 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Step Title */}
      <div>
        <h2 className="text-xl font-bold text-deep-charcoal">{steps[currentStep].title}</h2>
        <p className="text-muted-foreground">{steps[currentStep].description}</p>
      </div>

      {/* Step Content with transitions */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentStep === 0 && (
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/journal/voice")}
                    className="gap-2 w-full"
                  >
                    <Mic className="h-4 w-4" />
                    Голосовая запись
                  </Button>
                  <div>
                    <Label htmlFor="situation">Что произошло?</Label>
                    <Textarea
                      id="situation"
                      placeholder="Опишите ситуацию, которая вызвала реакцию..."
                      value={form.situation}
                      onChange={(e) => updateForm("situation", e.target.value)}
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Когда это было?</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={form.date}
                      onChange={(e) => updateForm("date", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Теги</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={form.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleTag(tag) } }}
                      tabIndex={0}
                      role="checkbox"
                      aria-checked={form.tags.includes(tag)}
                    >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label>Что вы чувствуете?</Label>
                    <p className="text-xs text-muted-foreground mb-3">Выберите 1-3 эмоции</p>
                    <div className="grid grid-cols-5 gap-2">
                      {emotions.map((emotion) => (
                        <motion.button
                          key={emotion.name}
                          onClick={() => toggleEmotion(emotion.name)}
                          whileTap={{ scale: 0.95 }}
                          className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all ${
                            form.emotions.includes(emotion.name)
                              ? "bg-primary/10 ring-2 ring-primary"
                              : "bg-secondary hover:bg-secondary/80"
                          }`}
                        >
                          <span className="text-xl">{emotion.icon}</span>
                          <span className="text-[10px] text-muted-foreground">{emotion.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                <Label htmlFor="intensity">Насколько интенсивно? {form.intensity}/10</Label>
                <input
                  id="intensity"
                  type="range"
                      min="1"
                      max="10"
                      value={form.intensity}
                      onChange={(e) => updateForm("intensity", parseInt(e.target.value))}
                      className="w-full mt-2 accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Слабо</span>
                      <span>Очень сильно</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <Label htmlFor="thought">Какая мысль пришла вам в голову?</Label>
                  <Textarea
                    id="thought"
                    placeholder="Запишите первую мысль, которая возникла..."
                    value={form.automaticThought}
                    onChange={(e) => updateForm("automaticThought", e.target.value)}
                    className="mt-1 min-h-[120px]"
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <Label htmlFor="body">Что вы чувствовали в теле?</Label>
                  <Textarea
                    id="body"
                    placeholder="Напряжение в плечах, учащённое сердцебиение, ком в горле..."
                    value={form.bodySensations}
                    onChange={(e) => updateForm("bodySensations", e.target.value)}
                    className="mt-1 min-h-[120px]"
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <Label htmlFor="behavior">Как вы отреагировали?</Label>
                  <Textarea
                    id="behavior"
                    placeholder="Что вы сделали или чего избежали?"
                    value={form.behavior}
                    onChange={(e) => updateForm("behavior", e.target.value)}
                    className="mt-1 min-h-[120px]"
                  />
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm text-primary/80">
                      AI предлагает возможные искажения на основе вашей записи
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {distortions.map((d) => (
                      <motion.button
                        key={d.name}
                        onClick={() => toggleDistortion(d.name)}
                        whileTap={{ scale: 0.97 }}
                        className={`flex items-start gap-3 rounded-xl p-3 text-left transition-all ${
                          form.distortions.includes(d.name)
                            ? "bg-primary/10 ring-2 ring-primary"
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        <span className="text-lg">{d.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{d.name}</p>
                          <p className="text-xs text-muted-foreground">{d.description}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="against">Доказательства ПРОТИВ этой мысли</Label>
                    <Textarea
                      id="against"
                      placeholder="Факты, которые опровергают автоматическую мысль..."
                      value={form.evidenceAgainst}
                      onChange={(e) => updateForm("evidenceAgainst", e.target.value)}
                      className="mt-1 min-h-[150px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="for">Доказательства ЗА эту мысль</Label>
                    <Textarea
                      id="for"
                      placeholder="Факты, которые подтверждают автоматическую мысль..."
                      value={form.evidenceFor}
                      onChange={(e) => updateForm("evidenceFor", e.target.value)}
                      className="mt-1 min-h-[150px]"
                    />
                  </div>
                </div>
              )}

              {currentStep === 7 && (
                <div>
                  <Label htmlFor="alternative">Есть ли другой взгляд на ситуацию?</Label>
                  <Textarea
                    id="alternative"
                    placeholder="Запишите более сбалансированную мысль..."
                    value={form.alternativeThought}
                    onChange={(e) => updateForm("alternativeThought", e.target.value)}
                    className="mt-1 min-h-[120px]"
                  />
                </div>
              )}

              {currentStep === 8 && (
                <div className="space-y-4">
                  <div>
                    <Label>Как вы чувствуете себя сейчас?</Label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {emotions.slice(0, 10).map((emotion) => (
                        <motion.button
                          key={emotion.name}
                          onClick={() => toggleEmotion(emotion.name)}
                          whileTap={{ scale: 0.95 }}
                          className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all ${
                            form.emotions.includes(emotion.name)
                              ? "bg-primary/10 ring-2 ring-primary"
                              : "bg-secondary hover:bg-secondary/80"
                          }`}
                        >
                          <span className="text-xl">{emotion.icon}</span>
                          <span className="text-[10px] text-muted-foreground">{emotion.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                <Label htmlFor="newIntensity">Интенсивность сейчас: {form.newIntensity}/10</Label>
                <input
                  id="newIntensity"
                  type="range"
                      min="1"
                      max="10"
                      value={form.newIntensity}
                      onChange={(e) => updateForm("newIntensity", parseInt(e.target.value))}
                      className="w-full mt-2 accent-primary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lessons">Чему вы научились?</Label>
                    <Textarea
                      id="lessons"
                      placeholder="Ваши выводы из этой ситуации..."
                      value={form.lessonsLearned}
                      onChange={(e) => updateForm("lessonsLearned", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {currentStep === 9 && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                    <h3 className="font-medium mb-2">Ваша запись</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Ситуация:</span> {form.situation || "—"}</p>
                      <p><span className="text-muted-foreground">Эмоции:</span> {form.emotions.join(", ") || "—"}</p>
                      <p><span className="text-muted-foreground">Мысль:</span> {form.automaticThought || "—"}</p>
                      <p><span className="text-muted-foreground">Искажения:</span> {form.distortions.join(", ") || "—"}</p>
                      <p><span className="text-muted-foreground">Альтернатива:</span> {form.alternativeThought || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm text-emerald-700">
                      Изменение интенсивности: {form.intensity} → {form.newIntensity}
                      {form.newIntensity < form.intensity ? " (снижение! 🎉)" : ""}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={prev}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
        {currentStep === steps.length - 1 ? (
          <GradientButton onClick={handleSave} className="gap-2 shadow-lg shadow-primary/20">
            <Check className="h-4 w-4" />
            Сохранить
          </GradientButton>
        ) : (
          <GradientButton onClick={next} className="gap-2">
            Далее
            <ArrowRight className="h-4 w-4" />
          </GradientButton>
        )}
      </div>
    </div>
  )
}

export default function NewJournalEntryPage() {
  return (
    <Suspense>
      <NewJournalEntryInner />
    </Suspense>
  )
}
