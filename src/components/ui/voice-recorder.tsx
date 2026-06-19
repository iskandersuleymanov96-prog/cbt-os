"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Mic, MicOff, Pause, Play, Square, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  language?: string
  className?: string
}

type RecordingState = "idle" | "recording" | "paused" | "stopped"

export function VoiceRecorder({
  onTranscript,
  language = "ru-RU",
  className,
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>("idle")
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [timer, setTimer] = useState(0)
  const [isSupported] = useState(() => {
    if (typeof window === "undefined") return false
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  })
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = ""
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += text
        } else {
          interim += text
        }
      }
      if (final) {
        setTranscript((prev) => {
          const updated = prev ? prev + " " + final : final
          onTranscript(updated)
          return updated
        })
      }
      setInterimTranscript(interim)
    }

    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        console.error("Speech recognition error:", event.error)
      }
    }

    recognition.onend = () => {
      if (state === "recording") {
        try {
          recognition.start()
        } catch {
          // already started
        }
      }
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [language, state, onTranscript, isSupported])

  const startTimer = useCallback(() => {
    setTimer(0)
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) return
    setTranscript("")
    setInterimTranscript("")
    try {
      recognitionRef.current.start()
      setState("recording")
      startTimer()
    } catch {
      // already started
    }
  }, [startTimer])

  const pauseRecording = useCallback(() => {
    if (!recognitionRef.current) return
    recognitionRef.current.abort()
    setState("paused")
    stopTimer()
  }, [stopTimer])

  const resumeRecording = useCallback(() => {
    if (!recognitionRef.current) return
    try {
      recognitionRef.current.start()
      setState("recording")
      startTimer()
    } catch {
      // already started
    }
  }, [startTimer])

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return
    recognitionRef.current.abort()
    setState("stopped")
    stopTimer()
    setInterimTranscript("")
  }, [stopTimer])

  const resetRecording = useCallback(() => {
    setTranscript("")
    setInterimTranscript("")
    setTimer(0)
    setState("idle")
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  if (!isSupported) {
    return (
      <div className={cn("flex flex-col items-center gap-4 p-8", className)}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <MicOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-medium text-deep-charcoal">
            Голосовые записи недоступны
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ваш браузер не поддерживает распознавание речи. Попробуйте Chrome
            или Edge.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* Timer */}
      <div className="text-4xl font-bold tabular-nums text-deep-charcoal">
        {formatTime(timer)}
      </div>

      {/* Recording indicator */}
      {state === "recording" && (
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
          <span className="text-sm font-medium text-red-500">Запись...</span>
        </div>
      )}
      {state === "paused" && (
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="text-sm font-medium text-amber-600">Пауза</span>
        </div>
      )}

      {/* Main record button */}
      <div className="relative">
        {state === "idle" && (
          <button
            onClick={startRecording}
            className="group relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 transition-premium hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-1 active:translate-y-0"
          >
            <Mic className="h-10 w-10" />
            <span className="absolute inset-0 rounded-full animate-breathe" />
          </button>
        )}

        {state === "recording" && (
          <button
            onClick={pauseRecording}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 transition-premium"
          >
            <Pause className="h-10 w-10" />
          </button>
        )}

        {state === "paused" && (
          <button
            onClick={resumeRecording}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gradient-mid text-white shadow-lg shadow-primary/30 transition-premium hover:shadow-xl hover:shadow-primary/40"
          >
            <Play className="h-10 w-10" />
          </button>
        )}

        {state === "stopped" && (
          <button
            onClick={resetRecording}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-premium hover:bg-secondary/80"
          >
            <RotateCcw className="h-10 w-10" />
          </button>
        )}
      </div>

      {/* Stop button */}
      {(state === "recording" || state === "paused") && (
        <button
          onClick={stopRecording}
          className="flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-medium text-deep-charcoal transition-premium hover:bg-secondary/80"
        >
          <Square className="h-4 w-4" />
          Остановить
        </button>
      )}

      {/* Live transcript */}
      {(state === "recording" || state === "paused") && (transcript || interimTranscript) && (
        <div className="w-full max-w-md rounded-xl border border-white/40 bg-white/60 p-4 backdrop-blur-xl">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Транскрипция:
          </p>
          <p className="min-h-[60px] text-sm leading-relaxed text-deep-charcoal">
            {transcript}
            <span className="text-muted-foreground italic">
              {interimTranscript}
            </span>
          </p>
        </div>
      )}

      {/* Instructions */}
      {state === "idle" && (
        <p className="text-center text-sm text-muted-foreground">
          Нажмите на микрофон, чтобы начать запись
        </p>
      )}
    </div>
  )
}
