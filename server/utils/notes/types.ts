export const NOTE_TYPES = ['general', 'project', 'job', 'technical'] as const
export type NoteType = typeof NOTE_TYPES[number]

export interface NoteRow {
  id: number
  title: string
  content: string
  type: string
  tags: string[] | null
  is_pinned: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: number
  title: string
  content: string
  type: string
  tags: string[]
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface NoteInput {
  title: string
  content: string
  type?: string
  tags?: string[]
  isPinned?: boolean
}
