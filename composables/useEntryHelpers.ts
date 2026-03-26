import { ENTRY_CONFIG, type EntryTypeKey } from '~/server/utils/log/entry-config'

const MOOD_CONFIG = {
  great: { icon: 'i-heroicons-bolt-solid', color: 'text-emerald-400', badgeColor: 'green', label: 'Great' },
  good: { icon: 'i-heroicons-sun-solid', color: 'text-sky-400', badgeColor: 'emerald', label: 'Good' },
  neutral: { icon: 'i-heroicons-minus-circle-solid', color: 'text-zinc-500', badgeColor: 'gray', label: 'Neutral' },
  low: { icon: 'i-heroicons-cloud-solid', color: 'text-orange-400', badgeColor: 'orange', label: 'Low' },
  bad: { icon: 'i-heroicons-exclamation-triangle-solid', color: 'text-red-400', badgeColor: 'red', label: 'Bad' },
} as const

export const MOODS = Object.entries(MOOD_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
  icon: cfg.icon,
  color: cfg.color,
}))

const TYPE_COLOR_CLASS: Record<string, string> = {
  journal: 'text-zinc-400',
  reflection: 'text-purple-400',
  decision: 'text-amber-400',
  therapy: 'text-blue-400',
}

const TYPE_BADGE_CLASS: Record<string, string> = {
  journal: 'bg-zinc-900 text-zinc-300',
  reflection: 'bg-purple-950 text-purple-300',
  decision: 'bg-amber-950 text-amber-300',
  therapy: 'bg-blue-950 text-blue-300',
}

export const MOOD_OPTIONS = [
  { label: 'All moods', value: '' },
  ...MOODS.map(m => ({ label: m.label, value: m.value })),
]

export const TYPE_OPTIONS = [
  { label: 'All types', value: '' },
  ...Object.entries(ENTRY_CONFIG).map(([value, cfg]) => ({ label: cfg.label, value })),
]

export const useEntryHelpers = () => {
  // Mood helpers
  const moodIcon = (mood: string) => MOOD_CONFIG[mood as keyof typeof MOOD_CONFIG]?.icon ?? 'i-heroicons-minus-circle-solid'
  const moodIconColor = (mood: string) => MOOD_CONFIG[mood as keyof typeof MOOD_CONFIG]?.color ?? 'text-zinc-500'
  const moodBadgeColor = (mood: string) => MOOD_CONFIG[mood as keyof typeof MOOD_CONFIG]?.badgeColor ?? 'gray'

  // Entry type helpers
  const entryIcon = (type: string) => ENTRY_CONFIG[type as EntryTypeKey]?.icon ?? 'i-heroicons-document-text'
  const typeLabel = (type: string) => ENTRY_CONFIG[type as EntryTypeKey]?.label ?? type
  const typeColor = (type: string) => ENTRY_CONFIG[type as EntryTypeKey]?.color ?? 'gray'
  const typeIconColor = (type: string) => TYPE_COLOR_CLASS[type] ?? 'text-zinc-400'
  const typeBadgeClass = (type: string) => TYPE_BADGE_CLASS[type] ?? ''

  return {
    moodIcon,
    moodIconColor,
    moodBadgeColor,
    entryIcon,
    typeLabel,
    typeColor,
    typeIconColor,
    typeBadgeClass,
  }
}
