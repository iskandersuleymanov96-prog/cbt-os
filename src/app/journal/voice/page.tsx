"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Mic, Pencil } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { VoiceRecorder } from "@/components/ui/voice-recorder"
import { GradientButton } from "@/components/ui/gradient-button"
import { SuccessToast } from "@/components/ui/success-toast"

type PageState = "recording" | "review"

export default function VoiceJournalPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>("recording")
  const [transcript, setTranscript] = useState("")
  const [showSaved, setShowSaved] = useState(false)

  const handleTranscript = useCallback((text: string) => {
    setTranscript(text)
  }, [])

  const handleFinishRecording = () => {
    if (transcript.trim()) {
      setPageState("review")
    }
  }

  const handleContinue = () => {
    setShowSaved(true)
    setTimeout(() => {
      router.push(`/journal/new?situation=${encodeURIComponent(transcript)}`)
    }, 800)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <SuccessToast
        show={showSaved}
        type="saved"
        title="Текст скопирован!"
        message="Переход к дневнику..."
        onClose={() => setShowSaved(false)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
        <span className="text-sm text-muted-foreground">Голосовая запись</span>
      </div>

      <AnimatePresence mode="wait">
        {pageState === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Hero section */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10">
                <Mic className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-deep-charcoal">
                Расскажите о ситуации
              </h1>
              <p className="mt-2 text-muted-foreground">
                Опишите словами, что произошло и что вы чувствуете
              </p>
            </div>

            {/* Recorder */}
            <Card className="glass-card">
              <CardContent className="p-8">
                <VoiceRecorder
                  onTranscript={handleTranscript}
                  language="ru-RU"
                />
              </CardContent>
            </Card>

            {/* Continue button */}
            {transcript.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <GradientButton
                  onClick={handleFinishRecording}
                  size="lg"
                  className="gap-2 shadow-lg shadow-primary/20"
                >
                  <Check className="h-4 w-4" />
                  Готово
                </GradientButton>
              </motion.div>
            )}
          </motion.div>
        )}

        {pageState === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50">
                <Pencil className="h-8 w-8 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-deep-charcoal">
                Проверьте текст
              </h1>
              <p className="mt-2 text-muted-foreground">
                Отредактируйте при необходимости
              </p>
            </div>

            <Card className="glass-card">
              <CardContent className="p-6">
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="min-h-[200px] text-base leading-relaxed"
                  placeholder="Ваш текст..."
                />
              </CardContent>
            </Card>

            <div className="flex justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setPageState("recording")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Записать заново
              </Button>
              <GradientButton
                onClick={handleContinue}
                className="gap-2 shadow-lg shadow-primary/20"
              >
                Продолжить к дневнику
                <ArrowRight className="h-4 w-4" />
              </GradientButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
