export const SKILL_CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Language', 'Database', 'Tool', 'AI/ML', 'Auth', 'Soft Skills'] as const
export type SkillCategory = typeof SKILL_CATEGORIES[number]

export const SKILL_LEVELS = ['Advanced', 'Intermediate', 'Learning', 'Exposure', 'Basic'] as const
export type SkillLevel = typeof SKILL_LEVELS[number]

// Database row types (snake_case)
export interface SkillRow {
  id: number
  name: string
  category: string
  proficiency: number
  level: string | null
  notes: string | null
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
  location: string | null
  employment_type: string | null
  tech_stack: string[] | null
  highlights: string[] | null
  reason_for_leaving: string | null
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
  type: string | null
  role_type: string | null
  status: string | null
  highlights: string[] | null
  client: string | null
  created_at: string
  updated_at: string
}

// API types (camelCase)
export interface Skill {
  id: number
  name: string
  category: string
  proficiency: number
  level: string | null
  notes: string | null
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
  location: string | null
  employmentType: string | null
  techStack: string[]
  highlights: string[]
  reasonForLeaving: string | null
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
  type: string | null
  roleType: string | null
  status: string | null
  highlights: string[]
  client: string | null
  createdAt: string
  updatedAt: string
}

// Input types
export interface SkillInput {
  name: string
  category: string
  proficiency: number | null
  level: string | null
  notes: string | null
}

export interface ExperienceInput {
  company: string
  role: string
  startDate: string
  endDate: string | null
  description: string | null
  isCurrent: boolean
  location: string | null
  employmentType: string | null
  techStack: string[]
  highlights: string[]
  reasonForLeaving: string | null
}

export interface ProjectInput {
  name: string
  description: string | null
  url: string | null
  repoUrl: string | null
  techStack: string[]
  imageUrl: string | null
  isFeatured: boolean
  type: string | null
  roleType: string | null
  status: string | null
  highlights: string[]
  client: string | null
}

// --- About ---

export interface AboutRow {
  id: number
  headline: string | null
  bio: string | null
  location: string | null
  avatar_url: string | null
  email: string | null
  job_title: string | null
  status: string | null
  cv_pdf_url: string | null
  cv_html: string | null
  created_at: string
  updated_at: string
}

export interface About {
  id: number
  headline: string | null
  bio: string | null
  location: string | null
  avatarUrl: string | null
  email: string | null
  jobTitle: string | null
  status: string | null
  cvPdfUrl: string | null
  cvHtml: string | null
  createdAt: string
  updatedAt: string
}

export interface AboutInput {
  headline: string | null
  bio: string | null
  location: string | null
  avatarUrl: string | null
  email: string | null
  jobTitle: string | null
  status: string | null
  cvPdfUrl: string | null
  cvHtml: string | null
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

// --- Certifications ---

export interface CertificationRow {
  id: number
  name: string
  institution: string
  platform: string | null
  date: string | null
  url: string | null
  created_at: string
  updated_at: string
}

export interface Certification {
  id: number
  name: string
  institution: string
  platform: string | null
  date: string | null
  url: string | null
  createdAt: string
  updatedAt: string
}

export interface CertificationInput {
  name: string
  institution: string
  platform: string | null
  date: string | null
  url: string | null
}

// --- References ---

export interface ReferenceRow {
  id: number
  name: string
  title: string | null
  contact: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Reference {
  id: number
  name: string
  title: string | null
  contact: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ReferenceInput {
  name: string
  title: string | null
  contact: string | null
  notes: string | null
}
