export const SKILL_CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Language', 'Database', 'Tool'] as const
export type SkillCategory = typeof SKILL_CATEGORIES[number]

// Database row types (snake_case)
export interface SkillRow {
  id: number
  name: string
  category: string
  proficiency: number
  created_at: string
  updated_at: string
}

export interface ExperienceRow {
  id: number
  company: string
  role: string
  start_date: string
  end_date: string | null
  description: string | null
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface ProjectRow {
  id: number
  name: string
  description: string | null
  url: string | null
  repo_url: string | null
  tech_stack: string[] | null
  image_url: string | null
  is_featured: boolean
  created_at: string
  updated_at: string
}

// API types (camelCase)
export interface Skill {
  id: number
  name: string
  category: string
  proficiency: number
  createdAt: string
  updatedAt: string
}

export interface Experience {
  id: number
  company: string
  role: string
  startDate: string
  endDate: string | null
  description: string | null
  isCurrent: boolean
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: number
  name: string
  description: string | null
  url: string | null
  repoUrl: string | null
  techStack: string[]
  imageUrl: string | null
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

// Input types
export interface SkillInput {
  name: string
  category: string
  proficiency: number
}

export interface ExperienceInput {
  company: string
  role: string
  startDate: string
  endDate: string | null
  description: string | null
  isCurrent: boolean
}

export interface ProjectInput {
  name: string
  description: string | null
  url: string | null
  repoUrl: string | null
  techStack: string[]
  imageUrl: string | null
  isFeatured: boolean
}

// --- About ---

export interface AboutRow {
  id: number
  headline: string | null
  bio: string | null
  location: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface About {
  id: number
  headline: string | null
  bio: string | null
  location: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface AboutInput {
  headline: string | null
  bio: string | null
  location: string | null
  avatarUrl: string | null
}

// --- Education ---

export interface EducationRow {
  id: number
  institution: string
  degree: string
  field_of_study: string | null
  start_date: string
  end_date: string | null
  description: string | null
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface Education {
  id: number
  institution: string
  degree: string
  fieldOfStudy: string | null
  startDate: string
  endDate: string | null
  description: string | null
  isCurrent: boolean
  createdAt: string
  updatedAt: string
}

export interface EducationInput {
  institution: string
  degree: string
  fieldOfStudy: string | null
  startDate: string
  endDate: string | null
  description: string | null
  isCurrent: boolean
}

// --- Links ---

export interface LinkRow {
  id: number
  label: string
  url: string
  icon: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface Link {
  id: number
  label: string
  url: string
  icon: string | null
  position: number
  createdAt: string
  updatedAt: string
}

export interface LinkInput {
  label: string
  url: string
  icon: string | null
  position: number
}

// --- Goals ---

export const GOAL_STATUSES = ['not_started', 'in_progress', 'completed'] as const
export type GoalStatus = typeof GOAL_STATUSES[number]

export interface GoalRow {
  id: number
  title: string
  description: string | null
  status: string
  target_date: string | null
  category: string | null
  created_at: string
  updated_at: string
}

export interface Goal {
  id: number
  title: string
  description: string | null
  status: string
  targetDate: string | null
  category: string | null
  createdAt: string
  updatedAt: string
}

export interface GoalInput {
  title: string
  description: string | null
  status: string
  targetDate: string | null
  category: string | null
}
