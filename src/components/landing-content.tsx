"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Brain, BookOpen, BarChart3, Lightbulb, Dumbbell, ArrowRight, Sparkles, Shield, Heart } from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { GlassCard } from "@/components/ui/glass-card"

const features = [
  {
    icon: BookOpen,
    title: "КПТ-Дневник",
    description: "Структурированные записи для анализа мыслей и эмоций с AI-подсказками",
    href: "/journal",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Brain,
    title: "Карта паттернов",
    description: "Выявляйте повторяющиеся когнитивные искажения и поведенческие модели",
    href: "/patterns",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Lightbulb,
    title: "ИИ-рефлексия",
    description: "Персональные инсайты и рекомендации на основе ваших записей",
    href: "/ai",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: BarChart3,
    title: "Аналитика",
    description: "Отслеживайте прогресс, динамику настроения и рост осознанности",
    href: "/analytics",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Dumbbell,
    title: "Упражнения",
    description: "Практики для развития осознанности и управления стрессом",
    href: "/exercises",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: Shield,
    title: "Приватность",
    description: "Ваши данные зашифрованы и принадлежат только вам",
    href: "/settings",
    color: "bg-slate-50 text-slate-600",
  },
]

const steps = [
  {
    step: "01",
    title: "Запишите ситуацию",
    description: "Опишите что произошло, ваши мысли и эмоции в структурированном формате",
  },
  {
    step: "02",
    title: "Проанализируйте",
    description: "Система поможет выявить когнитивные искажения и найти альтернативные перспективы",
  },
  {
    step: "03",
    title: "Откройте паттерны",
    description: "Увидьте повторяющиеся модели мышления и развивайте новые привычки",
  },
]

const testimonials = [
  {
    text: "Наконец-то приложение, которое помогает не просто записывать, а действительно понимать свои мысли.",
    author: "Анна",
    role: "Пользователь 3 месяца",
  },
  {
    text: "Карта паттернов открыла мне глаза на повторяющиеся модели. Это бесценно.",
    author: "Михаил",
    role: "Пользователь 6 месяцев",
  },
  {
    text: "AI-рефлексия как личный коуч, который всегда доступен и никогда не осуждает.",
    author: "Елена",
    role: "Пользователь 2 месяца",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function LandingContent() {
  return (
    <div className="min-h-screen bg-warm-white relative overflow-hidden">
      {/* Ambient background */}
      <div className="ambient-glow" />
      <div className="ambient-glow-2" />

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary border border-primary/20"
            >
              <Sparkles className="h-4 w-4" />
              Личная система осознанности
            </motion.div>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-deep-charcoal md:text-7xl lg:text-8xl">
              <span className="gradient-text">CBT</span>{" "}
              <span className="text-deep-charcoal">OS</span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
            >
              Понимайте свои мысли, выявляйте когнитивные паттерны 
              и развивайте осознанность. Ваш внутренний мир — под вашим контролем.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Link href="/dashboard">
                <GradientButton size="lg">
                  Начать путь
                  <ArrowRight className="h-4 w-4" />
                </GradientButton>
              </Link>
              <Link href="/onboarding">
                <GradientButton variant="outline" size="lg">
                  Узнать больше
                </GradientButton>
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating elements */}
          <div className="absolute top-20 left-10 animate-float opacity-20 hidden lg:block">
            <div className="h-20 w-20 rounded-2xl bg-primary/20 rotate-12" />
          </div>
          <div className="absolute bottom-20 right-10 animate-float opacity-20 hidden lg:block" style={{ animationDelay: "1s" }}>
            <div className="h-16 w-16 rounded-full bg-primary/10 -rotate-12" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-deep-charcoal md:text-4xl">
            Всё для вашей осознанности
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Инструменты, которые помогают лучше понимать себя и свои мыслительные паттерны
          </p>
        </motion.div>
        
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div key={feature.href} variants={item}>
              <Link href={feature.href}>
                <GlassCard className="h-full group" padding="lg">
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} transition-transform duration-300 group-hover:scale-110`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-deep-charcoal">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-deep-charcoal md:text-4xl">
              Как это работает
            </h2>
            <p className="text-lg text-muted-foreground">
              Простой процесс для глубоких изменений
            </p>
          </motion.div>
          <div className="grid gap-12 md:grid-cols-3">
            {steps.map((s, index) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-2xl font-bold text-white shadow-premium">
                  {s.step}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-deep-charcoal">
                  {s.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-deep-charcoal md:text-4xl">
              Что говорят пользователи
            </h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, index) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard padding="lg">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-amber-400">★</span>
                    ))}
                  </div>
                  <p className="text-foreground mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-medium">
                      {t.author[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-deep-charcoal">{t.author}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative">
              <Heart className="h-12 w-12 text-primary mx-auto mb-6 animate-pulse-soft" />
              <h2 className="mb-4 text-3xl font-bold text-deep-charcoal">
                Начните путь к пониманию себя
              </h2>
              <p className="mb-8 text-lg text-muted-foreground max-w-xl mx-auto">
                Присоединяйтесь к тысячам людей, которые уже открыли свои мыслительные паттерны
              </p>
              <Link href="/dashboard">
                <GradientButton size="lg">
                  Бесплатно начать
                  <ArrowRight className="h-4 w-4" />
                </GradientButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-deep-charcoal">CBT OS</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/settings" className="hover:text-foreground transition-colors">Настройки</Link>
              <Link href="/exercises" className="hover:text-foreground transition-colors">Упражнения</Link>
              <Link href="/analytics" className="hover:text-foreground transition-colors">Аналитика</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 CBT OS. Личная система осознанности.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
