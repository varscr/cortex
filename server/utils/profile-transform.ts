import type { SkillRow, Skill, ExperienceRow, Experience, ProjectRow, Project, AboutRow, About, EducationRow, Education, LinkRow, Link, GoalRow, Goal } from './profile-types'

export function toSkill(row: SkillRow): Skill {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    proficiency: row.proficiency,
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
