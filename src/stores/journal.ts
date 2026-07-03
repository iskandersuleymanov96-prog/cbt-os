import { create } from "zustand"
import type { JournalEntry, JournalDraft } from "@/types"

interface JournalState {
  entries: JournalEntry[]
  currentEntry: JournalEntry | null
  drafts: Record<string, JournalDraft>
  isLoading: boolean
  searchQuery: string
  setEntries: (entries: JournalEntry[]) => void
  addEntry: (entry: JournalEntry) => void
  updateEntry: (id: string, data: Partial<JournalEntry>) => void
  removeEntry: (id: string) => void
  removeAllEntries: () => void
  duplicateEntry: (id: string) => JournalEntry | null
  setCurrentEntry: (entry: JournalEntry | null) => void
  setLoading: (loading: boolean) => void
  setSearchQuery: (query: string) => void
  getFilteredEntries: () => JournalEntry[]
  saveDraft: (entryId: string, formData: Record<string, unknown>, step: number) => void
  getDraft: (entryId: string) => JournalDraft | null
  removeDraft: (entryId: string) => void
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  currentEntry: null,
  drafts: {},
  isLoading: false,
  searchQuery: "",
  setEntries: (entries) => set({ entries }),
  addEntry: (entry) =>
    set((state) => ({ entries: [entry, ...state.entries] })),
  updateEntry: (id, data) =>
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? { ...e, ...data } : e)),
      currentEntry:
        state.currentEntry?.id === id
          ? { ...state.currentEntry, ...data }
          : state.currentEntry,
    })),
  removeEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
      currentEntry: state.currentEntry?.id === id ? null : state.currentEntry,
    })),
  removeAllEntries: () =>
    set({ entries: [], currentEntry: null }),
  duplicateEntry: (id) => {
    const state = get()
    const original = state.entries.find((e) => e.id === id)
    if (!original) return null
    const duplicate: JournalEntry = {
      ...original,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      tags: [...original.tags],
    }
    set((state) => ({ entries: [duplicate, ...state.entries] }))
    return duplicate
  },
  setCurrentEntry: (entry) => set({ currentEntry: entry }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  getFilteredEntries: () => {
    const { entries, searchQuery } = get()
    if (!searchQuery.trim()) return entries
    const q = searchQuery.toLowerCase()
    return entries.filter(
      (e) =>
        e.situation.toLowerCase().includes(q) ||
        e.emotion.toLowerCase().includes(q) ||
        e.automatic_thought.toLowerCase().includes(q) ||
        e.alternative_thought.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    )
  },
  saveDraft: (entryId, formData, step) =>
    set((state) => ({
      drafts: {
        ...state.drafts,
        [entryId]: {
          entry_id: entryId,
          form_data: formData,
          step,
          updated_at: new Date().toISOString(),
        },
      },
    })),
  getDraft: (entryId) => {
    const { drafts } = get()
    return drafts[entryId] || null
  },
  removeDraft: (entryId) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [entryId]: _, ...rest } = state.drafts
      return { drafts: rest }
    }),
}))
