<template>
  <div>
    <UiPageHeader title="Profile" description="About, skills, experience, education, projects, certifications, links, goals, and references" />

    <div class="space-y-8">
      <ProfileAboutSection :about="about" @refresh="refreshAbout" />
      <ProfileSkillsSection :skills="skills ?? []" @refresh="refreshSkills" @delete="confirmDelete" />
      <ProfileExperienceSection :experience="experience ?? []" @refresh="refreshExperience" @delete="confirmDelete" />
      <ProfileEducationSection :education="education ?? []" @refresh="refreshEducation" @delete="confirmDelete" />
      <ProfileProjectsSection :projects="projects ?? []" @refresh="refreshProjects" @delete="confirmDelete" />
      <ProfileCertificationsSection :certifications="certifications ?? []" @refresh="refreshCertifications" @delete="confirmDelete" />
      <ProfileLinksSection :links="links ?? []" @refresh="refreshLinks" @delete="confirmDelete" />
      <ProfileGoalsSection :goals="goals ?? []" @refresh="refreshGoals" @delete="confirmDelete" />
      <ProfileReferencesSection :references="references ?? []" @refresh="refreshReferences" @delete="confirmDelete" />
    </div>

    <UiConfirmModal
      v-model="deleteModalOpen"
      title="Delete item"
      :message="`Are you sure you want to delete '${deleteName}'?`"
      confirm-label="Delete"
      :loading="deleting"
      @confirm="executeDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Skill, Experience, Project, About, Education, Link, Goal, Certification, Reference } from '~/server/utils/profile-types'

const toast = useToast()

const { data: about, refresh: refreshAbout } = useFetch<About | null>('/api/profile/about')
const { data: skills, refresh: refreshSkills } = useFetch<Skill[]>('/api/profile/skills')
const { data: experience, refresh: refreshExperience } = useFetch<Experience[]>('/api/profile/experience')
const { data: education, refresh: refreshEducation } = useFetch<Education[]>('/api/profile/education')
const { data: projects, refresh: refreshProjects } = useFetch<Project[]>('/api/profile/projects')
const { data: certifications, refresh: refreshCertifications } = useFetch<Certification[]>('/api/profile/certifications')
const { data: links, refresh: refreshLinks } = useFetch<Link[]>('/api/profile/links')
const { data: goals, refresh: refreshGoals } = useFetch<Goal[]>('/api/profile/goals')
const { data: references, refresh: refreshReferences } = useFetch<Reference[]>('/api/profile/references')

// --- Delete ---
const deleteModalOpen = ref(false)
const deleting = ref(false)
const deleteType = ref('')
const deleteId = ref(0)
const deleteName = ref('')

const deleteEndpoints: Record<string, string> = {
  skill: 'skills',
  experience: 'experience',
  project: 'projects',
  education: 'education',
  certification: 'certifications',
  link: 'links',
  goal: 'goals',
  reference: 'references',
}

const deleteRefreshers: Record<string, () => void> = {
  skill: () => refreshSkills(),
  experience: () => refreshExperience(),
  project: () => refreshProjects(),
  education: () => refreshEducation(),
  certification: () => refreshCertifications(),
  link: () => refreshLinks(),
  goal: () => refreshGoals(),
  reference: () => refreshReferences(),
}

function confirmDelete(type: string, id: number, name: string) {
  deleteType.value = type
  deleteId.value = id
  deleteName.value = name
  deleteModalOpen.value = true
}

async function executeDelete() {
  deleting.value = true
  try {
    await $fetch(`/api/profile/${deleteEndpoints[deleteType.value]}/${deleteId.value}`, { method: 'DELETE' })
    toast.add({ title: 'Deleted successfully', color: 'green' })
    deleteModalOpen.value = false
    deleteRefreshers[deleteType.value]()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to delete', color: 'red' })
  } finally {
    deleting.value = false
  }
}
</script>
