import { upsertDocument, deleteDocument } from '../embed/core'

// ── Experience ────────────────────────────────────────────────────────────────

function buildExperienceText(row: ExperienceRow): string {
  const period = row.is_current
    ? `${row.start_date}–present`
    : `${row.start_date}–${row.end_date ?? ''}`
  const parts = [row.employment_type, period, row.location].filter(Boolean).join(', ')
  let text = `Role: ${row.role} at ${row.company} (${parts})`
  if (row.description) text += `\nDescription: ${row.description}`
  if (row.tech_stack?.length) text += `\nTech stack: ${row.tech_stack.join(', ')}`
  if (row.highlights?.length) text += `\nHighlights: ${row.highlights.join('; ')}`
  if (row.reason_for_leaving) text += `\nReason for leaving: ${row.reason_for_leaving}`
  return text
}

export async function upsertExperienceEmbedding(row: ExperienceRow, userId: string): Promise<void> {
  await upsertDocument(`profile/experience/${row.id}`, 'profile', buildExperienceText(row), {
    section: 'experience',
    company: row.company,
    role: row.role,
    isCurrent: row.is_current,
  }, userId)
}

export async function deleteExperienceEmbedding(id: number, userId: string): Promise<void> {
  await deleteDocument(`profile/experience/${id}`, userId)
}

// ── Projects ──────────────────────────────────────────────────────────────────

function buildProjectText(row: ProjectRow): string {
  const meta = [row.type, row.status].filter(Boolean).join(', ')
  let text = `Project: ${row.name}${meta ? ` (${meta})` : ''}`
  if (row.role_type) text += `\nRole: ${row.role_type}`
  if (row.client) text += `\nClient: ${row.client}`
  if (row.description) text += `\nDescription: ${row.description}`
  if (row.tech_stack?.length) text += `\nTech stack: ${row.tech_stack.join(', ')}`
  if (row.highlights?.length) text += `\nHighlights: ${row.highlights.join('; ')}`
  return text
}

export async function upsertProjectEmbedding(row: ProjectRow, userId: string): Promise<void> {
  await upsertDocument(`profile/project/${row.id}`, 'profile', buildProjectText(row), {
    section: 'project',
    name: row.name,
    status: row.status,
    isFeatured: row.is_featured,
  }, userId)
}

export async function deleteProjectEmbedding(id: number, userId: string): Promise<void> {
  await deleteDocument(`profile/project/${id}`, userId)
}

// ── Skills ────────────────────────────────────────────────────────────────────

function buildSkillText(row: SkillRow): string {
  let text = `Skill: ${row.name} — ${row.category}`
  const detail = [row.level, row.proficiency != null ? `${row.proficiency}/5` : null]
    .filter(Boolean)
    .join(', ')
  if (detail) text += ` (${detail})`
  if (row.notes) text += `\nNotes: ${row.notes}`
  return text
}

export async function upsertSkillEmbedding(row: SkillRow, userId: string): Promise<void> {
  await upsertDocument(`profile/skill/${row.id}`, 'profile', buildSkillText(row), {
    section: 'skill',
    name: row.name,
    category: row.category,
    level: row.level,
  }, userId)
}

export async function deleteSkillEmbedding(id: number, userId: string): Promise<void> {
  await deleteDocument(`profile/skill/${id}`, userId)
}

// ── Education ─────────────────────────────────────────────────────────────────

function buildEducationText(row: EducationRow): string {
  const period = row.is_current
    ? `${row.start_date}–present`
    : `${row.start_date}–${row.end_date ?? ''}`
  let text = `Education: ${row.degree} at ${row.institution} (${period})`
  if (row.field_of_study) text += `\nField: ${row.field_of_study}`
  if (row.description) text += `\nDescription: ${row.description}`
  return text
}

export async function upsertEducationEmbedding(row: EducationRow, userId: string): Promise<void> {
  await upsertDocument(`profile/education/${row.id}`, 'profile', buildEducationText(row), {
    section: 'education',
    institution: row.institution,
    degree: row.degree,
  }, userId)
}

export async function deleteEducationEmbedding(id: number, userId: string): Promise<void> {
  await deleteDocument(`profile/education/${id}`, userId)
}

// ── Certifications ────────────────────────────────────────────────────────────

function buildCertificationText(row: CertificationRow): string {
  const parts = [row.institution, row.platform, row.date].filter(Boolean).join(', ')
  return `Certification: ${row.name}${parts ? ` — ${parts}` : ''}`
}

export async function upsertCertificationEmbedding(row: CertificationRow, userId: string): Promise<void> {
  await upsertDocument(`profile/certification/${row.id}`, 'profile', buildCertificationText(row), {
    section: 'certification',
    name: row.name,
    institution: row.institution,
  }, userId)
}

export async function deleteCertificationEmbedding(id: number, userId: string): Promise<void> {
  await deleteDocument(`profile/certification/${id}`, userId)
}

// ── Goals ─────────────────────────────────────────────────────────────────────

function buildGoalText(row: GoalRow): string {
  let text = `Goal [${row.status}]: ${row.title}`
  if (row.category) text += `\nCategory: ${row.category}`
  if (row.target_date) text += ` | Target: ${row.target_date}`
  if (row.description) text += `\nDescription: ${row.description}`
  return text
}

export async function upsertGoalEmbedding(row: GoalRow, userId: string): Promise<void> {
  await upsertDocument(`profile/goal/${row.id}`, 'profile', buildGoalText(row), {
    section: 'goal',
    title: row.title,
    status: row.status,
    category: row.category,
  }, userId)
}

export async function deleteGoalEmbedding(id: number, userId: string): Promise<void> {
  await deleteDocument(`profile/goal/${id}`, userId)
}

// ── About ─────────────────────────────────────────────────────────────────────

function buildAboutText(row: AboutRow): string {
  const header = [row.job_title, row.location].filter(Boolean).join(' | ')
  let text = header ? `${header}\n` : ''
  if (row.headline) text += `Headline: ${row.headline}\n`
  if (row.bio) text += `Bio: ${row.bio}`
  if (row.status) text += `\nStatus: ${row.status}`
  return text.trim()
}

export async function upsertAboutEmbedding(row: AboutRow, userId: string): Promise<void> {
  if (!buildAboutText(row)) return
  await upsertDocument(`profile/about/${row.id}`, 'profile', buildAboutText(row), {
    section: 'about',
    jobTitle: row.job_title,
    location: row.location,
    status: row.status,
  }, userId)
}
