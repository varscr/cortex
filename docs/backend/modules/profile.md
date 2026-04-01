# Profile Module

Personal profile with multiple sections (about, skills, experience, projects, education, links, goals, certifications, references).

## Utils: `server/utils/profile/`

| File | Exports |
|------|---------|
| `types.ts` | `SKILL_CATEGORIES`, `SKILL_LEVELS`, `GOAL_STATUSES`, Row/API/Input types for all sections |
| `validate.ts` | `validateSkillInput`, `validateExperienceInput`, `validateProjectInput`, etc. |
| `transform.ts` | `toSkill`, `toExperience`, `toProject`, `toAbout`, `toEducation`, `toLink`, `toGoal`, `toCertification`, `toReference` |
| `embed.ts` | `upsertProfileEmbedding(section, row)`, `deleteProfileEmbedding(section, id)` |

## API: `server/api/profile/`

Nested routes per section: `server/api/profile/<section>/` (e.g., skills, experience, projects).

## Schema

Tables in `db/init/01-core.sql`.
