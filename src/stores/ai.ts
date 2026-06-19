import { create } from "zustand"
import type { AIInsight } from "@/types"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

interface AIState {
  insights: AIInsight[]
  messages: ChatMessage[]
  isTyping: boolean
  insightFilter: AIInsight["type"] | "all"
  setInsights: (insights: AIInsight[]) => void
  addInsight: (insight: AIInsight) => void
  markInsightRead: (id: string) => void
  archiveInsight: (id: string) => void
  deleteInsight: (id: string) => void
  getFilteredInsights: () => AIInsight[]
  setInsightFilter: (filter: AIInsight["type"] | "all") => void
  addMessage: (message: ChatMessage) => void
  setMessages: (messages: ChatMessage[]) => void
  setTyping: (typing: boolean) => void
}

export const useAIStore = create<AIState>((set, get) => ({
  insights: [],
  messages: [],
  isTyping: false,
  insightFilter: "all",
  setInsights: (insights) => set({ insights }),
  addInsight: (insight) =>
    set((state) => ({ insights: [insight, ...state.insights] })),
  markInsightRead: (id) =>
    set((state) => ({
      insights: state.insights.map((i) =>
        i.id === id ? { ...i, is_read: true } : i
      ),
    })),
  archiveInsight: (id) =>
    set((state) => ({
      insights: state.insights.map((i) =>
        i.id === id ? { ...i, is_archived: true } : i
      ),
    })),
  deleteInsight: (id) =>
    set((state) => ({
      insights: state.insights.filter((i) => i.id !== id),
    })),
  setInsightFilter: (filter) => set({ insightFilter: filter }),
  getFilteredInsights: () => {
    const { insights, insightFilter } = get()
    return insights.filter((i) => {
      if (i.is_archived) return false
      if (insightFilter === "all") return true
      return i.type === insightFilter
    })
  },
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setTyping: (typing) => set({ isTyping: typing }),
}))
