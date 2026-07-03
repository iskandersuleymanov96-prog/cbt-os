"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Sparkles, Bot, User, Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface APIStatus {
  configured: boolean
  provider: string
  model: string
}

const quickPrompts = [
  "Проанализируй моё настроение за неделю",
  "Какие когнитивные искажения я чаще всего использую?",
  "Помоги мне найти альтернативную мысль",
  "Какие паттерны ты видишь в моих записях?",
]

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  isStreaming?: boolean
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Привет! Я ваш AI-ассистент для рефлексии. Я проанализировал ваши записи и готов помочь вам лучше понять свои мысли и паттерны. Что вас интересует?",
    timestamp: new Date().toISOString(),
  },
]

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [apiStatus, setApiStatus] = useState<APIStatus | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then(setApiStatus)
      .catch(() => setApiStatus({ configured: false, provider: "none", model: "demo" }))
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }

    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      isStreaming: true,
    }

    setMessages((prev) => [...prev, userMessage, aiMessage])
    setInput("")
    setIsTyping(true)

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      abortControllerRef.current = new AbortController()

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content.trim(), history }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader")

      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk

        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId
              ? { ...m, content: accumulated }
              : m
          )
        )
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? { ...m, isStreaming: false }
            : m
        )
      )
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return
      }

      console.error("Stream error:", err)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? {
                ...m,
                content: "Извините, произошла ошибка. Попробуйте ещё раз.",
                isStreaming: false,
              }
            : m
        )
      )
    } finally {
      setIsTyping(false)
      abortControllerRef.current = null
    }
  }, [isTyping, messages])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-deep-charcoal">ИИ-рефлексия</h1>
        <p className="text-muted-foreground">Персональные инсайты на основе ваших записей</p>
        {apiStatus && !apiStatus.configured && (
          <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Демо-режим: добавьте OPENROUTER_API_KEY в .env.local для работы с AI</span>
          </div>
        )}
        {apiStatus?.configured && (
          <p className="text-xs text-muted-foreground mt-1">
            Подключено: {apiStatus.provider} • {apiStatus.model}
          </p>
        )}
      </motion.div>

      {/* Quick Prompts */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
        {quickPrompts.map((prompt, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            className="whitespace-nowrap shrink-0"
            onClick={() => sendMessage(prompt)}
            disabled={isTyping}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {prompt}
          </Button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {message.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-white mt-1">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "gradient-primary text-white"
                  : "bg-secondary text-foreground"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex items-center gap-1 mb-1.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary">AI-ассистент</span>
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary animate-pulse rounded-full align-text-bottom" />
                )}
              </div>
            </div>

            {message.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground mt-1">
                <User className="h-4 w-4" />
              </div>
            )}
          </motion.div>
        ))}

        {isTyping && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-white mt-1">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-secondary rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <Textarea
          placeholder="Задайте вопрос или опишите ситуацию..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[48px] max-h-[120px] resize-none"
          rows={1}
          disabled={isTyping}
        />
        <Button
          size="icon"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isTyping}
          className="shrink-0 h-12 w-12 gradient-primary text-white shadow-lg shadow-primary/20"
        >
          {isTyping ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
