import type { SkillInput, ExperienceInput, ProjectInput, AboutInput, EducationInput, LinkInput, GoalInput, CertificationInput, ReferenceInput } from './profile-types'
import { SKILL_CATEGORIES, SKILL_LEVELS, GOAL_STATUSES } from './profile-types'

export function validateSkillInput(body: any): { data?: SkillInput; error?: string } {
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return { error: 'Skill name is required' }
  }

  if (!body.category || !SKILL_CATEGORIES.includes(body.category)) {
    return { error: `Category must be one of: ${SKILL_CATEGORIES.join(', ')}` }
  }

  const proficiency = body.proficiency ?? null
  if (proficiency !== null && (typeof proficiency !== 'number' || proficiency < 1 || proficiency > 5)) {
    return { error: 'Proficiency must be between 1 and 5' }
  }

  const level = body.level ?? null
  if (level !== null && !SKILL_LEVELS.includes(level)) {
    return { error: `Level must be one of: ${SKILL_LEVELS.join(', ')}` }
  }

  return {
    data: {
      name: body.name.trim(),
      category: body.category,
      proficiency,
      level,
      notes: body.notes ?? null,
    }
  }
}

export function validateExperienceInput(body: any): { data?: ExperienceInput; error?: string } {
  if (!body.company || typeof body.company !== 'string' || !body.company.trim()) {
    return { error: 'Company is required' }
  }

  if (!body.role || typeof body.role !== 'string' || !body.role.trim()) {
    return { error: 'Role is required' }
  }

  if (!body.startDate || typeof body.startDate !== 'string') {
    return { error: 'Start date is required' }
  }

  if (body.techStack && !Array.isArray(body.techStack)) {
    return { error: 'Tech stack must be an array' }
  }

  if (body.highlights && !Array.isArray(body.highlights)) {
    return { error: 'Highlights must be an array' }
  }

  return {
    data: {
      company: body.company.trim(),
      role: body.role.trim(),
      startDate: body.startDate,
      endDate: body.endDate ?? null,
      description: body.description ?? null,
      isCurrent: body.isCurrent ?? false,
      location: body.location ?? null,
      employmentType: body.employmentType ?? null,
      techStack: body.techStack ?? [],
      highlights: body.highlights ?? [],
      reasonForLeaving: body.reasonForLeaving ?? null,
    }
  }
}

export function validateProjectInput(body: any): { data?: ProjectInput; error?: string } {
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return { error: 'Project name is required' }
  }

  if (body.techStack && !Array.isArray(body.techStack)) {
    return { error: 'Tech stack must be an array' }
  }

  if (body.highlights && !Array.isArray(body.highlights)) {
    return { error: 'Highlights must be an array' }
  }

  return {
    data: {
      name: body.name.trim(),
      description: body.description ?? null,
      url: body.url ?? null,
      repoUrl: body.repoUrl ?? null,
      techStack: body.techStack ?? [],
      imageUrl: body.imageUrl ?? null,
      isFeatured: body.isFeatured ?? false,
      type: body.type ?? null,
      roleType: body.roleType ?? null,
      status: body.status ?? null,
      highlights: body.highlights ?? [],
      client: body.client ?? null,
    }
  }
}

export function validateAboutInput(body: any): { data?: AboutInput; error?: string } {
  return {
    data: {
      headline: body.headline ?? null,
      bio: body.bio ?? null,
      location: body.location ?? null,
      avatarUrl: body.avatarUrl ?? null,
      email: body.email ?? null,
      jobTitle: body.jobTitle ?? null,
      status: body.status ?? null,
      cvPdfUrl: body.cvPdfUrl ?? null,
      cvHtml: body.cvHtml ?? null,
    }
  }
}

export function validateEducationInput(body: any): { data?: EducationInput; error?: string } {
  if (!body.institution || typeof body.institution !== 'string' || !body.institution.trim()) {
    return { error: 'Institution is required' }
  }

  if (!body.degree || typeof body.degree !== 'string' || !body.degree.trim()) {
    return { error: 'Degree is required' }
  }

  if (!body.startDate || typeof body.startDate !== 'string') {
    return { error: 'Start date is required' }
  }

  return {
    data: {
      institution: body.institution.trim(),
      degree: body.degree.trim(),
      fieldOfStudy: body.fieldOfStudy ?? null,
      startDate: body.startDate,
      endDate: body.endDate ?? null,
      description: body.description ?? null,
      isCurrent: body.isCurrent ?? false,
    }
  }
}

export function validateLinkInput(body: any): { data?: LinkInput; error?: string } {
  if (!body.label || typeof body.label !== 'string' || !body.label.trim()) {
    return { error: 'Label is required' }
  }

  if (!body.url || typeof body.url !== 'string' || !body.url.trim()) {
    return { error: 'URL is required' }
  }

  return {
    data: {
      label: body.label.trim(),
      url: body.url.trim(),
      icon: body.icon ?? null,
      position: body.position ?? 0,
    }
  }
}

export function validateGoalInput(body: any): { data?: GoalInput; error?: string } {
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    return { error: 'Title is required' }
  }

  const status = body.status ?? 'not_started'
  if (!GOAL_STATUSES.includes(status)) {
    return { error: `Status must be one of: ${GOAL_STATUSES.join(', ')}` }
  }

  return {
    data: {
      title: body.title.trim(),
      description: body.description ?? null,
      status,
      targetDate: body.targetDate ?? null,
      category: body.category ?? null,
    }
  }
}

export function validateCertificationInput(body: any): { data?: CertificationInput; error?: string } {
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return { error: 'Certification name is required' }
  }

  if (!body.institution || typeof body.institution !== 'string' || !body.institution.trim()) {
    return { error: 'Institution is required' }
  }

  return {
    data: {
      name: body.name.trim(),
      institution: body.institution.trim(),
      platform: body.platform ?? null,
      date: body.date ?? null,
      url: body.url ?? null,
    }
  }
}

export function validateReferenceInput(body: any): { data?: ReferenceInput; error?: string } {
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return { error: 'Name is required' }
  }

  return {
    data: {
      name: body.name.trim(),
      title: body.title ?? null,
      contact: body.contact ?? null,
      notes: body.notes ?? null,
    }
  }
}
