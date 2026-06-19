"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Brain, ArrowRight, Check, Sparkles, Heart, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GradientButton } from "@/components/ui/gradient-button"

const steps = [
  {
    title: "Добро пожаловать в CBT OS",
    subtitle: "Ваш путь к пониманию мыслей начинается здесь",
    content: "welcome",
  },
  {
    title: "Что привело вас сюда?",
    subtitle: "Выберите ваши цели",
    content: "goals",
  },
  {
    title: "Знакомы ли вы с КПТ?",
    subtitle: "Это поможет персонализировать опыт",
    content: "experience",
  },
  {
    title: "Когда вам удобно записываться?",
    subtitle: "Мы напомним вам в удобное время",
    content: "reminders",
  },
  {
    title: "Вы готовы!",
    subtitle: "Давайте создадим первую запись",
    content: "ready",
  },
]

const goals = [
  { text: "Хочу понять свои эмоции", icon: "🧠" },
  { text: "Борюсь с тревожностью", icon: "💭" },
  { text: "Хочу замечать паттерны мышления", icon: "🔄" },
  { text: "Мне нужна поддержка в трудные моменты", icon: "🤝" },
  { text: "Хочу развить осознанность", icon: "✨" },
  { text: "Рекомендовал терапевт", icon: "👩‍⚕️" },
]

const experiences = [
  { label: "Нет, впервые", description: "Мы поможем вам начать", icon: "🌱" },
  { label: "Немного знаю", description: "Углубим вашу практику", icon: "📖" },
  { label: "Активно практикую", description: "Поможем систематизировать", icon: "🎯" },
]

const reminderTimes = [
  { label: "Утром", time: "8:00-10:00", icon: "🌅" },
  { label: "Днём", time: "12:00-14:00", icon: "☀️" },
  { label: "Вечером", time: "18:00-20:00", icon: "🌆" },
  { label: "Перед сном", time: "21:00-23:00", icon: "🌙" },
  { label: "Не напоминать", time: "", icon: "🔕" },
]

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    scale: 0.98,
  }),
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null)
  const [selectedReminder, setSelectedReminder] = useState<string | null>(null)
  const [direction, setDirection] = useState(1)

  const progress = ((currentStep + 1) / steps.length) * 100

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  const next = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1)
      setCurrentStep((s) => s + 1)
    } else {
      router.push("/dashboard")
    }
  }

  const prev = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((s) => s - 1)
    }
  }

  return (
    <div className="min-h-screen bg-warm-white flex flex-col relative overflow-hidden">
      {/* Ambient background */}
      <div className="ambient-glow" />
      <div className="ambient-glow-2" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-cta shadow-sm">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-deep-charcoal">CBT OS</span>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Пропустить
        </button>
      </div>

      {/* Animated Progress */}
      <div className="relative z-10 px-6">
        <div className="relative h-1.5 overflow-hidden rounded-full bg-secondary/80">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full gradient-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Шаг {currentStep + 1} из {steps.length}
          </p>
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                className={`h-1 rounded-full ${
                  i <= currentStep ? "bg-primary" : "bg-secondary"
                }`}
                initial={{ width: 8 }}
                animate={{ width: i === currentStep ? 20 : 8 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content with page transitions */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-center mb-8">
                <motion.h1
                  className="text-2xl font-bold text-deep-charcoal mb-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {steps[currentStep].title}
                </motion.h1>
                <motion.p
                  className="text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {steps[currentStep].subtitle}
                </motion.p>
              </div>

              {steps[currentStep].content === "welcome" && (
                <div className="text-center space-y-6">
                  <motion.div
                    className="flex justify-center"
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  >
                    <div className="relative">
                      <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-primary/15 to-violet-500/10 flex items-center justify-center animate-breathe">
                        <Brain className="h-14 w-14 text-primary" />
                      </div>
                      <motion.div
                        className="absolute -top-2 -right-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.6, delay: 0.5 }}
                      >
                        <Sparkles className="h-6 w-6 text-amber-400" />
                      </motion.div>
                    </div>
                  </motion.div>
                  <motion.p
                    className="text-muted-foreground leading-relaxed max-w-sm mx-auto"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    CBT OS поможет вам понять свои мысли, выявить паттерны
                    и развить более здоровые привычки мышления.
                  </motion.p>
                  <motion.div
                    className="flex justify-center gap-6 text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> Бесплатно</span>
                    <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> Приватно</span>
                    <span className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> AI</span>
                  </motion.div>
                </div>
              )}

              {steps[currentStep].content === "goals" && (
                <div className="grid gap-2">
                  {goals.map((goal, i) => (
                    <motion.button
                      key={goal.text}
                      onClick={() => toggleGoal(goal.text)}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className={`flex items-center gap-3 rounded-xl p-4 text-left transition-all duration-200 ${
                        selectedGoals.includes(goal.text)
                          ? "bg-primary/10 ring-2 ring-primary shadow-sm"
                          : "bg-secondary/60 hover:bg-secondary"
                      }`}
                    >
                      <span className="text-lg">{goal.icon}</span>
                      <span className="flex-1 text-sm font-medium">{goal.text}</span>
                      <motion.div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                          selectedGoals.includes(goal.text)
                            ? "bg-primary border-primary text-white"
                            : "border-muted-foreground/30"
                        }`}
                        animate={selectedGoals.includes(goal.text) ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.2 }}
                      >
                        {selectedGoals.includes(goal.text) && <Check className="h-3 w-3" />}
                      </motion.div>
                    </motion.button>
                  ))}
                  {selectedGoals.length > 0 && (
                    <motion.p
                      className="text-center text-xs text-primary font-medium mt-2"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Выбрано: {selectedGoals.length}
                    </motion.p>
                  )}
                </div>
              )}

              {steps[currentStep].content === "experience" && (
                <div className="grid gap-3">
                  {experiences.map((exp, i) => (
                    <motion.button
                      key={exp.label}
                      onClick={() => setSelectedExperience(exp.label)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * i }}
                      className={`flex items-center gap-4 rounded-xl p-5 text-left transition-all duration-200 ${
                        selectedExperience === exp.label
                          ? "bg-primary/10 ring-2 ring-primary shadow-sm"
                          : "bg-secondary/60 hover:bg-secondary"
                      }`}
                    >
                      <span className="text-2xl">{exp.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{exp.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{exp.description}</p>
                      </div>
                      {selectedExperience === exp.label && (
                        <motion.div
                          className="ml-auto"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", bounce: 0.5 }}
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              {steps[currentStep].content === "reminders" && (
                <div className="grid grid-cols-2 gap-3">
                  {reminderTimes.map((rt, i) => (
                    <motion.button
                      key={rt.label}
                      onClick={() => setSelectedReminder(rt.label)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * i }}
                      className={`flex flex-col items-center gap-2 rounded-xl p-5 transition-all duration-200 ${
                        selectedReminder === rt.label
                          ? "bg-primary/10 ring-2 ring-primary shadow-sm"
                          : "bg-secondary/60 hover:bg-secondary"
                      }`}
                    >
                      <motion.span
                        className="text-3xl"
                        animate={selectedReminder === rt.label ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {rt.icon}
                      </motion.span>
                      <span className="text-sm font-medium">{rt.label}</span>
                      {rt.time && <span className="text-xs text-muted-foreground">{rt.time}</span>}
                    </motion.button>
                  ))}
                </div>
              )}

              {steps[currentStep].content === "ready" && (
                <div className="text-center space-y-6">
                  <motion.div
                    className="flex justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                  >
                    <div className="relative">
                      <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-emerald-400/20 to-green-500/10 flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
                        >
                          <Check className="h-14 w-14 text-emerald-500" />
                        </motion.div>
                      </div>
                      <motion.div
                        className="absolute -top-3 -right-3 text-2xl"
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.6, delay: 0.5 }}
                      >
                        🎉
                      </motion.div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-muted-foreground leading-relaxed">
                      Вы настроили свой профиль. Давайте создадим первую запись
                      и начнём путь к лучшему пониманию себя.
                    </p>
                  </motion.div>
                  <motion.div
                    className="flex justify-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> Персонализация
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3 text-rose-400 fill-rose-400" /> Поддержка
                    </span>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative z-10 p-6 flex gap-3">
        {currentStep > 0 && (
          <button
            onClick={prev}
            className="flex-1 h-11 rounded-xl border border-border bg-white/60 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-white/80 hover:border-border/80"
          >
            Назад
          </button>
        )}
        <GradientButton onClick={next} className="flex-1">
          {currentStep === steps.length - 1 ? (
            <>
              Создать первую запись
              <Sparkles className="h-4 w-4" />
            </>
          ) : (
            <>
              Продолжить
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </GradientButton>
      </div>
    </div>
  )
}
