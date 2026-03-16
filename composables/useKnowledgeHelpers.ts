const CATEGORY_CONFIG = {
  programming: { icon: 'i-heroicons-code-bracket', color: 'text-blue-400', badgeColor: 'blue', label: 'Programming' },
  architecture: { icon: 'i-heroicons-building-library', color: 'text-purple-400', badgeColor: 'purple', label: 'Architecture' },
  devops: { icon: 'i-heroicons-server-stack', color: 'text-green-400', badgeColor: 'green', label: 'DevOps' },
  concept: { icon: 'i-heroicons-light-bulb', color: 'text-amber-400', badgeColor: 'amber', label: 'Concept' },
  workflow: { icon: 'i-heroicons-arrow-path', color: 'text-cyan-400', badgeColor: 'cyan', label: 'Workflow' },
  tool: { icon: 'i-heroicons-wrench-screwdriver', color: 'text-orange-400', badgeColor: 'orange', label: 'Tool' },
  pattern: { icon: 'i-heroicons-squares-2x2', color: 'text-pink-400', badgeColor: 'pink', label: 'Pattern' },
  other: { icon: 'i-heroicons-tag', color: 'text-zinc-400', badgeColor: 'gray', label: 'Other' },
} as const

const CONFIDENCE_CONFIG = {
  high: { icon: 'i-heroicons-check-circle-solid', color: 'text-emerald-400', badgeColor: 'green', label: 'High' },
  medium: { icon: 'i-heroicons-minus-circle-solid', color: 'text-amber-400', badgeColor: 'amber', label: 'Medium' },
  low: { icon: 'i-heroicons-question-mark-circle-solid', color: 'text-red-400', badgeColor: 'red', label: 'Low' },
} as const

export const CATEGORY_OPTIONS = [
  { label: 'All categories', value: '' },
  ...Object.entries(CATEGORY_CONFIG).map(([value, cfg]) => ({ label: cfg.label, value })),
]

export const CONFIDENCE_OPTIONS = [
  { label: 'All confidence', value: '' },
  ...Object.entries(CONFIDENCE_CONFIG).map(([value, cfg]) => ({ label: cfg.label, value })),
]

export const REVIEWED_OPTIONS = [
  { label: 'All entries', value: '' },
  { label: 'Reviewed', value: 'true' },
  { label: 'Unreviewed', value: 'false' },
]

export const CONFIDENCES = Object.entries(CONFIDENCE_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
  icon: cfg.icon,
  color: cfg.color,
}))

export const useKnowledgeHelpers = () => {
  const categoryIcon = (cat: string) => CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.icon ?? 'i-heroicons-tag'
  const categoryColor = (cat: string) => CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.color ?? 'text-zinc-400'
  const categoryBadgeColor = (cat: string) => CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.badgeColor ?? 'gray'
  const categoryLabel = (cat: string) => CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.label ?? cat

  const confidenceIcon = (level: string) => CONFIDENCE_CONFIG[level as keyof typeof CONFIDENCE_CONFIG]?.icon ?? 'i-heroicons-minus-circle-solid'
  const confidenceColor = (level: string) => CONFIDENCE_CONFIG[level as keyof typeof CONFIDENCE_CONFIG]?.color ?? 'text-zinc-400'
  const confidenceBadgeColor = (level: string) => CONFIDENCE_CONFIG[level as keyof typeof CONFIDENCE_CONFIG]?.badgeColor ?? 'gray'
  const confidenceLabel = (level: string) => CONFIDENCE_CONFIG[level as keyof typeof CONFIDENCE_CONFIG]?.label ?? level

  return {
    categoryIcon,
    categoryColor,
    categoryBadgeColor,
    categoryLabel,
    confidenceIcon,
    confidenceColor,
    confidenceBadgeColor,
    confidenceLabel,
  }
}
