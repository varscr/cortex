import type { SkillRow, Skill, ExperienceRow, Experience, ProjectRow, Project, AboutRow, About, EducationRow, Education, LinkRow, Link, GoalRow, Goal, CertificationRow, Certification, ReferenceRow, Reference } from './types'

export function toSkill(row: SkillRow): Skill {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    proficiency: row.proficiency,
    level: row.level,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toExperience(row: ExperienceRow): Experience {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    isCurrent: row.is_current,
    location: row.location,
    employmentType: row.employment_type,
    techStack: row.tech_stack ?? [],
    highlights: row.highlights ?? [],
    reasonForLeaving: row.reason_for_leaving,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    url: row.url,
    repoUrl: row.repo_url,
    techStack: row.tech_stack ?? [],
    imageUrl: row.image_url,
    isFeatured: row.is_featured,
    type: row.type,
    roleType: row.role_type,
    status: row.status,
    highlights: row.highlights ?? [],
    client: row.client,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toAbout(row: AboutRow): About {
  return {
    id: row.id,
    headline: row.headline,
    bio: row.bio,
    location: row.location,
    avatarUrl: row.avatar_url,
    email: row.email,
    jobTitle: row.job_title,
    status: row.status,
    cvPdfUrl: row.cv_pdf_url,
    cvHtml: row.cv_html,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toEducation(row: EducationRow): Education {
  return {
    id: row.id,
    institution: row.institution,
    degree: row.degree,
    fieldOfStudy: row.field_of_study,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    isCurrent: row.is_current,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toLink(row: LinkRow): Link {
  return {
    id: row.id,
    label: row.label,
    url: row.url,
    icon: row.icon,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    targetDate: row.target_date,
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toCertification(row: CertificationRow): Certification {
  return {
    id: row.id,
    name: row.name,
    institution: row.institution,
    platform: row.platform,
    date: row.date,
    url: row.url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toReference(row: ReferenceRow): Reference {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    contact: row.contact,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
