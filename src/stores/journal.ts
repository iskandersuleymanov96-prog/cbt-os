import { create } from "zustand"
import type { JournalEntry, JournalDraft } from "@/types"

const STORAGE_KEY = "cbt-os-journal-entries"

function persistEntries(entries: JournalEntry[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }
}

function loadEntries(): JournalEntry[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as JournalEntry[]
  } catch {
    return []
  }
}

export type SortOption = "date-desc" | "date-asc" | "mood-desc" | "mood-asc"

interface JournalState {
  entries: JournalEntry[]
  currentEntry: JournalEntry | null
  drafts: Record<string, JournalDraft>
  isLoading: boolean
  searchQuery: string
  sortBy: SortOption
  filterEmotion: string | null
  filterDateFrom: string | null
  filterDateTo: string | null
  filterTags: string[]
  setEntries: (entries: JournalEntry[]) => void
  addEntry: (entry: JournalEntry) => void
  updateEntry: (id: string, data: Partial<JournalEntry>) => void
  removeEntry: (id: string) => void
  removeAllEntries: () => void
  duplicateEntry: (id: string) => JournalEntry | null
  setCurrentEntry: (entry: JournalEntry | null) => void
  setLoading: (loading: boolean) => void
  setSearchQuery: (query: string) => void
  setSortBy: (sort: SortOption) => void
  setFilterEmotion: (emotion: string | null) => void
  setFilterDateFrom: (date: string | null) => void
  setFilterDateTo: (date: string | null) => void
  setFilterTags: (tags: string[]) => void
  clearFilters: () => void
  getFilteredEntries: () => JournalEntry[]
  saveDraft: (entryId: string, formData: Record<string, unknown>, step: number) => void
  getDraft: (entryId: string) => JournalDraft | null
  removeDraft: (entryId: string) => void
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: loadEntries(),
  currentEntry: null,
  drafts: {},
  isLoading: false,
  searchQuery: "",
  sortBy: "date-desc",
  filterEmotion: null,
  filterDateFrom: null,
  filterDateTo: null,
  filterTags: [],
  setEntries: (entries) => {
    persistEntries(entries)
    set({ entries })
  },
  addEntry: (entry) => {
    const newEntries = [entry, ...get().entries]
    persistEntries(newEntries)
    set({ entries: newEntries })
  },
  updateEntry: (id, data) => {
    const newEntries = get().entries.map((e) => (e.id === id ? { ...e, ...data } : e))
    persistEntries(newEntries)
    set((state) => ({
      entries: newEntries,
      currentEntry:
        state.currentEntry?.id === id
          ? { ...state.currentEntry, ...data }
          : state.currentEntry,
    }))
  },
  removeEntry: (id) => {
    const newEntries = get().entries.filter((e) => e.id !== id)
    persistEntries(newEntries)
    set((state) => ({
      entries: newEntries,
      currentEntry: state.currentEntry?.id === id ? null : state.currentEntry,
    }))
  },
  removeAllEntries: () => {
    persistEntries([])
    set({ entries: [], currentEntry: null })
  },
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
    const newEntries = [duplicate, ...state.entries]
    persistEntries(newEntries)
    set({ entries: newEntries })
    return duplicate
  },
  setCurrentEntry: (entry) => set({ currentEntry: entry }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setFilterEmotion: (emotion) => set({ filterEmotion: emotion }),
  setFilterDateFrom: (date) => set({ filterDateFrom: date }),
  setFilterDateTo: (date) => set({ filterDateTo: date }),
  setFilterTags: (tags) => set({ filterTags: tags }),
  clearFilters: () =>
    set({
      searchQuery: "",
      filterEmotion: null,
      filterDateFrom: null,
      filterDateTo: null,
      filterTags: [],
    }),
  getFilteredEntries: () => {
    const { entries, searchQuery, sortBy, filterEmotion, filterDateFrom, filterDateTo, filterTags } = get()
    let result = [...entries]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (e) =>
          e.situation.toLowerCase().includes(q) ||
          e.emotion.toLowerCase().includes(q) ||
          e.automatic_thought.toLowerCase().includes(q) ||
          e.alternative_thought.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    if (filterEmotion) {
      result = result.filter((e) => e.emotion === filterEmotion)
    }

    if (filterDateFrom) {
      const from = new Date(filterDateFrom).getTime()
      result = result.filter((e) => new Date(e.created_at).getTime() >= from)
    }

    if (filterDateTo) {
      const to = new Date(filterDateTo).getTime() + 86400000
      result = result.filter((e) => new Date(e.created_at).getTime() < to)
    }

    if (filterTags.length > 0) {
      result = result.filter((e) =>
        filterTags.some((t) => e.tags.includes(t))
      )
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "mood-desc":
          return b.mood - a.mood
        case "mood-asc":
          return a.mood - b.mood
        case "date-desc":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return result
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
