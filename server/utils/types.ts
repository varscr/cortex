export const MOODS = ['great', 'good', 'neutral', 'low', 'bad'] as const
export type Mood = typeof MOODS[number]

export const ENTRY_TYPES = ['journal', 'reflection', 'decision', 'therapy'] as const
export type EntryType = typeof ENTRY_TYPES[number]

export interface LogEntryRow {
  id: number
  title: string | null
  content: string
  tags: string[] | null
  mood: string | null
  entry_type: string
  is_pinned: boolean
  date: string
  created_at: string
  updated_at: string
}

export interface LogEntry {
  id: number
  title: string | null
  content: string
  tags: string[]
  mood: string | null
  entryType: string
  isPinned: boolean
  date: string
  createdAt: string
  updatedAt: string
}

export interface LogEntryInput {
  title?: string | null
  content: string
  tags?: string[]
  mood?: string | null
  entryType?: string
  isPinned?: boolean
  date?: string
}

export interface LogStats {
  totalEntries: number
  entriesThisWeek: number
  entriesThisMonth: number
  moodDistribution: { mood: string; count: number }[]
  topTags: { tag: string; count: number }[]
  typeDistribution: { entryType: string; count: number }[]
  writingStreak: number
  currentWeekActivity: { date: string; count: number }[]
}
