export const ENTRY_CONFIG = {
  journal: {
    label: 'Journal',
    description: 'Write about your day, capture thoughts as they come.',
    placeholder: 'Start writing...',
    helper: "What happened today? What's on your mind?",
    color: 'zinc',
    icon: 'i-heroicons-pencil-square',
  },
  reflection: {
    label: 'Reflection',
    description: 'Pause and think deeper. What did you learn? What matters?',
    placeholder: "I've been thinking about...",
    helper: 'Take a moment. What have you been thinking about? What patterns do you notice?',
    color: 'purple',
    icon: 'i-heroicons-light-bulb',
  },
  decision: {
    label: 'Decision',
    description: 'Document a choice you made and why. Your future self will thank you.',
    placeholder: 'I decided to...',
    helper: 'What decision did you make? What were the alternatives? Why this choice?',
    color: 'amber',
    icon: 'i-heroicons-scale',
  },
  therapy: {
    label: 'Therapy',
    description: 'Notes from your session. What came up? What are the takeaways?',
    placeholder: "In today's session...",
    helper: 'What did you discuss? What resonated? Any homework or action items?',
    color: 'blue',
    icon: 'i-heroicons-heart',
  },
} as const

export type EntryTypeKey = keyof typeof ENTRY_CONFIG
