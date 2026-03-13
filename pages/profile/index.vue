<template>
  <div>
    <UiPageHeader title="Profile" description="About, skills, experience, education, projects, links, and goals" />

    <div class="space-y-8">
      <!-- About -->
      <UiCard title="About">
        <template #actions>
          <UiButton icon="i-heroicons-pencil-square" size="sm" label="Edit" @click="openAboutModal()" />
        </template>

        <div v-if="about" class="space-y-3">
          <div v-if="about.headline" class="text-sm font-medium text-white">{{ about.headline }}</div>
          <p v-if="about.bio" class="text-sm text-zinc-400 whitespace-pre-line">{{ about.bio }}</p>
          <p v-if="about.location" class="text-xs text-zinc-500 flex items-center gap-1">
            <UIcon name="i-heroicons-map-pin" class="w-3 h-3" /> {{ about.location }}
          </p>
        </div>
        <p v-else class="text-sm text-zinc-500">No about info yet. Click Edit to add your profile.</p>
      </UiCard>

      <!-- Skills -->
      <UiCard title="Skills">
        <template #actions>
          <UiButton icon="i-heroicons-plus" size="sm" label="Add" @click="openSkillModal()" />
        </template>

        <div v-if="skills?.length" class="space-y-6">
          <div v-for="(group, category) in skillsByCategory" :key="category">
            <h4 class="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">{{ category }}</h4>
            <div class="space-y-2">
              <div
                v-for="skill in group"
                :key="skill.id"
                class="flex items-center justify-between group"
              >
                <div class="flex items-center gap-3">
                  <span class="text-sm text-zinc-200">{{ skill.name }}</span>
                  <div class="flex gap-1">
                    <span
                      v-for="i in 5"
                      :key="i"
                      class="w-1.5 h-1.5 rounded-full"
                      :class="i <= skill.proficiency ? 'bg-white' : 'bg-zinc-700'"
                    />
                  </div>
                </div>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <UButton icon="i-heroicons-pencil-square" size="2xs" color="gray" variant="ghost" @click="openSkillModal(skill)" />
                  <UButton icon="i-heroicons-trash" size="2xs" color="gray" variant="ghost" @click="confirmDelete('skill', skill.id, skill.name)" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-zinc-500">No skills added yet.</p>
      </UiCard>

      <!-- Experience -->
      <UiCard title="Experience">
        <template #actions>
          <UiButton icon="i-heroicons-plus" size="sm" label="Add" @click="openExpModal()" />
        </template>

        <div v-if="experience?.length" class="space-y-6">
          <div
            v-for="exp in experience"
            :key="exp.id"
            class="relative pl-6 border-l border-white/10 group"
          >
            <div class="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full" :class="exp.isCurrent ? 'bg-green-500' : 'bg-zinc-600'" />
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-medium text-white">{{ exp.role }}</h4>
                  <span v-if="exp.isCurrent" class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-500/10 text-green-400">Current</span>
                </div>
                <p class="text-sm text-zinc-400">{{ exp.company }}</p>
                <p class="text-xs text-zinc-500 mt-0.5">{{ formatDateRange(exp.startDate, exp.endDate) }}</p>
                <p v-if="exp.description" class="text-sm text-zinc-400 mt-2">{{ exp.description }}</p>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <UButton icon="i-heroicons-pencil-square" size="2xs" color="gray" variant="ghost" @click="openExpModal(exp)" />
                <UButton icon="i-heroicons-trash" size="2xs" color="gray" variant="ghost" @click="confirmDelete('experience', exp.id, `${exp.role} at ${exp.company}`)" />
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-zinc-500">No experience added yet.</p>
      </UiCard>

      <!-- Education -->
      <UiCard title="Education">
        <template #actions>
          <UiButton icon="i-heroicons-plus" size="sm" label="Add" @click="openEduModal()" />
        </template>

        <div v-if="education?.length" class="space-y-6">
          <div
            v-for="edu in education"
            :key="edu.id"
            class="relative pl-6 border-l border-white/10 group"
          >
            <div class="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full" :class="edu.isCurrent ? 'bg-blue-500' : 'bg-zinc-600'" />
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-medium text-white">{{ edu.degree }}</h4>
                  <span v-if="edu.isCurrent" class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-500/10 text-blue-400">Current</span>
                </div>
                <p class="text-sm text-zinc-400">{{ edu.institution }}</p>
                <p v-if="edu.fieldOfStudy" class="text-xs text-zinc-500">{{ edu.fieldOfStudy }}</p>
                <p class="text-xs text-zinc-500 mt-0.5">{{ formatDateRange(edu.startDate, edu.endDate) }}</p>
                <p v-if="edu.description" class="text-sm text-zinc-400 mt-2">{{ edu.description }}</p>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <UButton icon="i-heroicons-pencil-square" size="2xs" color="gray" variant="ghost" @click="openEduModal(edu)" />
                <UButton icon="i-heroicons-trash" size="2xs" color="gray" variant="ghost" @click="confirmDelete('education', edu.id, `${edu.degree} at ${edu.institution}`)" />
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-zinc-500">No education added yet.</p>
      </UiCard>

      <!-- Projects -->
      <UiCard title="Projects">
        <template #actions>
          <UiButton icon="i-heroicons-plus" size="sm" label="Add" @click="openProjectModal()" />
        </template>

        <div v-if="projects?.length" class="space-y-4">
          <div
            v-for="project in projects"
            :key="project.id"
            class="p-4 rounded-lg border border-white/5 bg-white/[0.02] group"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-medium text-white">{{ project.name }}</h4>
                  <span v-if="project.isFeatured" class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-500/10 text-amber-400">Featured</span>
                </div>
                <p v-if="project.description" class="text-sm text-zinc-400 mt-1">{{ project.description }}</p>
                <div v-if="project.techStack.length" class="flex flex-wrap gap-1 mt-2">
                  <span
                    v-for="tech in project.techStack"
                    :key="tech"
                    class="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs"
                  >{{ tech }}</span>
                </div>
                <div v-if="project.url || project.repoUrl" class="flex gap-3 mt-2">
                  <a v-if="project.url" :href="project.url" target="_blank" class="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                    <UIcon name="i-heroicons-link" class="w-3 h-3" /> Live
                  </a>
                  <a v-if="project.repoUrl" :href="project.repoUrl" target="_blank" class="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                    <UIcon name="i-heroicons-code-bracket" class="w-3 h-3" /> Repo
                  </a>
                </div>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <UButton icon="i-heroicons-pencil-square" size="2xs" color="gray" variant="ghost" @click="openProjectModal(project)" />
                <UButton icon="i-heroicons-trash" size="2xs" color="gray" variant="ghost" @click="confirmDelete('project', project.id, project.name)" />
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-zinc-500">No projects added yet.</p>
      </UiCard>

      <!-- Links -->
      <UiCard title="Links">
        <template #actions>
          <UiButton icon="i-heroicons-plus" size="sm" label="Add" @click="openLinkModal()" />
        </template>

        <div v-if="links?.length" class="space-y-2">
          <div
            v-for="link in links"
            :key="link.id"
            class="flex items-center justify-between group"
          >
            <div class="flex items-center gap-3 min-w-0">
              <UIcon v-if="link.icon" :name="link.icon" class="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span class="text-sm text-zinc-200">{{ link.label }}</span>
              <a :href="link.url" target="_blank" class="text-xs text-zinc-500 hover:text-zinc-300 truncate">{{ link.url }}</a>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <UButton icon="i-heroicons-pencil-square" size="2xs" color="gray" variant="ghost" @click="openLinkModal(link)" />
              <UButton icon="i-heroicons-trash" size="2xs" color="gray" variant="ghost" @click="confirmDelete('link', link.id, link.label)" />
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-zinc-500">No links added yet.</p>
      </UiCard>

      <!-- Goals -->
      <UiCard title="Goals">
        <template #actions>
          <UiButton icon="i-heroicons-plus" size="sm" label="Add" @click="openGoalModal()" />
        </template>

        <div v-if="goals?.length" class="space-y-4">
          <div
            v-for="goal in goals"
            :key="goal.id"
            class="p-4 rounded-lg border border-white/5 bg-white/[0.02] group"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-medium text-white">{{ goal.title }}</h4>
                  <span
                    class="px-1.5 py-0.5 text-[10px] font-medium rounded"
                    :class="goalStatusClass(goal.status)"
                  >{{ goalStatusLabel(goal.status) }}</span>
                  <span v-if="goal.category" class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-zinc-800 text-zinc-400">{{ goal.category }}</span>
                </div>
                <p v-if="goal.description" class="text-sm text-zinc-400 mt-1">{{ goal.description }}</p>
                <p v-if="goal.targetDate" class="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                  <UIcon name="i-heroicons-calendar" class="w-3 h-3" /> {{ formatDate(goal.targetDate) }}
                </p>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <UButton icon="i-heroicons-pencil-square" size="2xs" color="gray" variant="ghost" @click="openGoalModal(goal)" />
                <UButton icon="i-heroicons-trash" size="2xs" color="gray" variant="ghost" @click="confirmDelete('goal', goal.id, goal.title)" />
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-zinc-500">No goals added yet.</p>
      </UiCard>
    </div>

    <!-- Skill Modal -->
    <UModal v-model="skillModalOpen" :ui="modalUi">
      <div class="linear-panel rounded-xl overflow-hidden">
        <div class="px-6 py-5 border-b border-white/5">
          <h3 class="text-lg font-semibold text-white">{{ editingSkill ? 'Edit Skill' : 'Add Skill' }}</h3>
        </div>
        <form @submit.prevent="saveSkill" class="p-6 space-y-4">
          <input
            v-model="skillForm.name"
            placeholder="Skill name"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <select
            v-model="skillForm.category"
            class="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-colors"
          >
            <option value="" disabled>Select category</option>
            <option v-for="cat in SKILL_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <div>
            <label class="text-xs text-zinc-400 block mb-2">Proficiency</label>
            <div class="flex gap-2">
              <button
                v-for="i in 5"
                :key="i"
                type="button"
                class="w-8 h-8 rounded-full border transition-colors"
                :class="i <= skillForm.proficiency ? 'bg-white border-white text-zinc-900' : 'border-white/10 text-zinc-500 hover:border-white/20'"
                @click="skillForm.proficiency = i"
              >{{ i }}</button>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <UButton label="Cancel" color="gray" variant="ghost" @click="skillModalOpen = false" />
            <UiButton type="submit" :label="editingSkill ? 'Update' : 'Add'" :loading="saving" />
          </div>
        </form>
      </div>
    </UModal>

    <!-- Experience Modal -->
    <UModal v-model="expModalOpen" :ui="modalUi">
      <div class="linear-panel rounded-xl overflow-hidden">
        <div class="px-6 py-5 border-b border-white/5">
          <h3 class="text-lg font-semibold text-white">{{ editingExp ? 'Edit Experience' : 'Add Experience' }}</h3>
        </div>
        <form @submit.prevent="saveExperience" class="p-6 space-y-4">
          <input
            v-model="expForm.company"
            placeholder="Company"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <input
            v-model="expForm.role"
            placeholder="Role / Title"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs text-zinc-400 block mb-1">Start date</label>
              <input
                v-model="expForm.startDate"
                type="date"
                class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-400 outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div>
              <label class="text-xs text-zinc-400 block mb-1">End date</label>
              <input
                v-model="expForm.endDate"
                type="date"
                :disabled="expForm.isCurrent"
                class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-400 outline-none focus:border-white/20 transition-colors disabled:opacity-40"
              />
            </div>
          </div>
          <label class="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input v-model="expForm.isCurrent" type="checkbox" class="rounded border-white/10 bg-transparent" @change="expForm.isCurrent && (expForm.endDate = '')" />
            Currently working here
          </label>
          <textarea
            v-model="expForm.description"
            placeholder="Description (optional)"
            rows="3"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors resize-none"
          />
          <div class="flex justify-end gap-2 pt-2">
            <UButton label="Cancel" color="gray" variant="ghost" @click="expModalOpen = false" />
            <UiButton type="submit" :label="editingExp ? 'Update' : 'Add'" :loading="saving" />
          </div>
        </form>
      </div>
    </UModal>

    <!-- Education Modal -->
    <UModal v-model="eduModalOpen" :ui="modalUi">
      <div class="linear-panel rounded-xl overflow-hidden">
        <div class="px-6 py-5 border-b border-white/5">
          <h3 class="text-lg font-semibold text-white">{{ editingEdu ? 'Edit Education' : 'Add Education' }}</h3>
        </div>
        <form @submit.prevent="saveEducation" class="p-6 space-y-4">
          <input
            v-model="eduForm.institution"
            placeholder="Institution"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <input
            v-model="eduForm.degree"
            placeholder="Degree"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <input
            v-model="eduForm.fieldOfStudy"
            placeholder="Field of study (optional)"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs text-zinc-400 block mb-1">Start date</label>
              <input
                v-model="eduForm.startDate"
                type="date"
                class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-400 outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div>
              <label class="text-xs text-zinc-400 block mb-1">End date</label>
              <input
                v-model="eduForm.endDate"
                type="date"
                :disabled="eduForm.isCurrent"
                class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-400 outline-none focus:border-white/20 transition-colors disabled:opacity-40"
              />
            </div>
          </div>
          <label class="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input v-model="eduForm.isCurrent" type="checkbox" class="rounded border-white/10 bg-transparent" @change="eduForm.isCurrent && (eduForm.endDate = '')" />
            Currently enrolled
          </label>
          <textarea
            v-model="eduForm.description"
            placeholder="Description (optional)"
            rows="3"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors resize-none"
          />
          <div class="flex justify-end gap-2 pt-2">
            <UButton label="Cancel" color="gray" variant="ghost" @click="eduModalOpen = false" />
            <UiButton type="submit" :label="editingEdu ? 'Update' : 'Add'" :loading="saving" />
          </div>
        </form>
      </div>
    </UModal>

    <!-- Project Modal -->
    <UModal v-model="projectModalOpen" :ui="modalUi">
      <div class="linear-panel rounded-xl overflow-hidden">
        <div class="px-6 py-5 border-b border-white/5">
          <h3 class="text-lg font-semibold text-white">{{ editingProject ? 'Edit Project' : 'Add Project' }}</h3>
        </div>
        <form @submit.prevent="saveProject" class="p-6 space-y-4">
          <input
            v-model="projectForm.name"
            placeholder="Project name"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <textarea
            v-model="projectForm.description"
            placeholder="Description (optional)"
            rows="3"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors resize-none"
          />
          <input
            v-model="projectForm.url"
            placeholder="Live URL (optional)"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <input
            v-model="projectForm.repoUrl"
            placeholder="Repo URL (optional)"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <!-- Tech Stack Tags -->
          <div>
            <label class="text-xs text-zinc-400 block mb-1">Tech stack</label>
            <div class="flex items-center gap-2 flex-wrap border border-white/10 rounded-lg px-3 py-2">
              <span
                v-for="(tech, i) in projectForm.techStack"
                :key="tech"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs cursor-pointer hover:bg-zinc-700 transition-colors"
                @click="projectForm.techStack.splice(i, 1)"
              >
                {{ tech }} <span class="opacity-60">&times;</span>
              </span>
              <input
                v-model="techInput"
                placeholder="Add tech..."
                class="bg-transparent border-0 text-sm text-zinc-400 placeholder-zinc-600 outline-none flex-1 min-w-[80px]"
                @keydown.enter.prevent="addTech"
              />
            </div>
          </div>
          <label class="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input v-model="projectForm.isFeatured" type="checkbox" class="rounded border-white/10 bg-transparent" />
            Featured project
          </label>
          <div class="flex justify-end gap-2 pt-2">
            <UButton label="Cancel" color="gray" variant="ghost" @click="projectModalOpen = false" />
            <UiButton type="submit" :label="editingProject ? 'Update' : 'Add'" :loading="saving" />
          </div>
        </form>
      </div>
    </UModal>

    <!-- Link Modal -->
    <UModal v-model="linkModalOpen" :ui="modalUi">
      <div class="linear-panel rounded-xl overflow-hidden">
        <div class="px-6 py-5 border-b border-white/5">
          <h3 class="text-lg font-semibold text-white">{{ editingLink ? 'Edit Link' : 'Add Link' }}</h3>
        </div>
        <form @submit.prevent="saveLink" class="p-6 space-y-4">
          <input
            v-model="linkForm.label"
            placeholder="Label"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <input
            v-model="linkForm.url"
            placeholder="URL"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <input
            v-model="linkForm.icon"
            placeholder="Icon (optional, e.g. i-heroicons-link)"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <div>
            <label class="text-xs text-zinc-400 block mb-1">Position</label>
            <input
              v-model.number="linkForm.position"
              type="number"
              min="0"
              class="w-24 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <UButton label="Cancel" color="gray" variant="ghost" @click="linkModalOpen = false" />
            <UiButton type="submit" :label="editingLink ? 'Update' : 'Add'" :loading="saving" />
          </div>
        </form>
      </div>
    </UModal>

    <!-- Goal Modal -->
    <UModal v-model="goalModalOpen" :ui="modalUi">
      <div class="linear-panel rounded-xl overflow-hidden">
        <div class="px-6 py-5 border-b border-white/5">
          <h3 class="text-lg font-semibold text-white">{{ editingGoal ? 'Edit Goal' : 'Add Goal' }}</h3>
        </div>
        <form @submit.prevent="saveGoal" class="p-6 space-y-4">
          <input
            v-model="goalForm.title"
            placeholder="Goal title"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <textarea
            v-model="goalForm.description"
            placeholder="Description (optional)"
            rows="3"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors resize-none"
          />
          <div>
            <label class="text-xs text-zinc-400 block mb-1">Status</label>
            <select
              v-model="goalForm.status"
              class="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-colors"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-zinc-400 block mb-1">Target date (optional)</label>
            <input
              v-model="goalForm.targetDate"
              type="date"
              class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-400 outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <input
            v-model="goalForm.category"
            placeholder="Category (optional)"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <div class="flex justify-end gap-2 pt-2">
            <UButton label="Cancel" color="gray" variant="ghost" @click="goalModalOpen = false" />
            <UiButton type="submit" :label="editingGoal ? 'Update' : 'Add'" :loading="saving" />
          </div>
        </form>
      </div>
    </UModal>

    <!-- About Modal -->
    <UModal v-model="aboutModalOpen" :ui="modalUi">
      <div class="linear-panel rounded-xl overflow-hidden">
        <div class="px-6 py-5 border-b border-white/5">
          <h3 class="text-lg font-semibold text-white">Edit About</h3>
        </div>
        <form @submit.prevent="saveAbout" class="p-6 space-y-4">
          <input
            v-model="aboutForm.headline"
            placeholder="Headline"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <textarea
            v-model="aboutForm.bio"
            placeholder="Bio"
            rows="4"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors resize-none"
          />
          <input
            v-model="aboutForm.location"
            placeholder="Location (optional)"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <input
            v-model="aboutForm.avatarUrl"
            placeholder="Avatar URL (optional)"
            class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-colors"
          />
          <div class="flex justify-end gap-2 pt-2">
            <UButton label="Cancel" color="gray" variant="ghost" @click="aboutModalOpen = false" />
            <UiButton type="submit" label="Save" :loading="saving" />
          </div>
        </form>
      </div>
    </UModal>

    <!-- Delete Confirmation -->
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
import { SKILL_CATEGORIES, GOAL_STATUSES } from '~/server/utils/profile-types'
import type { Skill, Experience, Project, About, Education, Link, Goal } from '~/server/utils/profile-types'

const toast = useToast()

// Data fetching
const { data: about, refresh: refreshAbout } = useFetch<About | null>('/api/profile/about')
const { data: skills, refresh: refreshSkills } = useFetch<Skill[]>('/api/profile/skills')
const { data: experience, refresh: refreshExperience } = useFetch<Experience[]>('/api/profile/experience')
const { data: education, refresh: refreshEducation } = useFetch<Education[]>('/api/profile/education')
const { data: projects, refresh: refreshProjects } = useFetch<Project[]>('/api/profile/projects')
const { data: links, refresh: refreshLinks } = useFetch<Link[]>('/api/profile/links')
const { data: goals, refresh: refreshGoals } = useFetch<Goal[]>('/api/profile/goals')

// Computed
const skillsByCategory = computed(() => {
  if (!skills.value) return {}
  const grouped: Record<string, Skill[]> = {}
  for (const skill of skills.value) {
    if (!grouped[skill.category]) grouped[skill.category] = []
    grouped[skill.category].push(skill)
  }
  return grouped
})

// Modal UI
const modalUi = {
  container: 'flex min-h-full items-center justify-center text-center',
  overlay: { background: 'bg-zinc-950/75 backdrop-blur-sm' },
  width: 'w-full sm:max-w-lg',
  background: 'bg-transparent',
  ring: '',
  shadow: '',
  rounded: '',
}

// Saving state
const saving = ref(false)

// --- About ---
const aboutModalOpen = ref(false)
const aboutForm = reactive({ headline: '', bio: '', location: '', avatarUrl: '' })

function openAboutModal() {
  if (about.value) {
    aboutForm.headline = about.value.headline ?? ''
    aboutForm.bio = about.value.bio ?? ''
    aboutForm.location = about.value.location ?? ''
    aboutForm.avatarUrl = about.value.avatarUrl ?? ''
  } else {
    aboutForm.headline = ''
    aboutForm.bio = ''
    aboutForm.location = ''
    aboutForm.avatarUrl = ''
  }
  aboutModalOpen.value = true
}

async function saveAbout() {
  saving.value = true
  try {
    const body = {
      headline: aboutForm.headline || null,
      bio: aboutForm.bio || null,
      location: aboutForm.location || null,
      avatarUrl: aboutForm.avatarUrl || null,
    }
    await $fetch('/api/profile/about', { method: 'PUT', body })
    toast.add({ title: 'About updated', color: 'green' })
    aboutModalOpen.value = false
    refreshAbout()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save about', color: 'red' })
  } finally {
    saving.value = false
  }
}

// --- Skills ---
const skillModalOpen = ref(false)
const editingSkill = ref<Skill | null>(null)
const skillForm = reactive({ name: '', category: '', proficiency: 3 })

function openSkillModal(skill?: Skill) {
  if (skill) {
    editingSkill.value = skill
    skillForm.name = skill.name
    skillForm.category = skill.category
    skillForm.proficiency = skill.proficiency
  } else {
    editingSkill.value = null
    skillForm.name = ''
    skillForm.category = ''
    skillForm.proficiency = 3
  }
  skillModalOpen.value = true
}

async function saveSkill() {
  saving.value = true
  try {
    if (editingSkill.value) {
      await $fetch(`/api/profile/skills/${editingSkill.value.id}`, { method: 'PUT', body: skillForm })
      toast.add({ title: 'Skill updated', color: 'green' })
    } else {
      await $fetch('/api/profile/skills', { method: 'POST', body: skillForm })
      toast.add({ title: 'Skill added', color: 'green' })
    }
    skillModalOpen.value = false
    refreshSkills()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save skill', color: 'red' })
  } finally {
    saving.value = false
  }
}

// --- Experience ---
const expModalOpen = ref(false)
const editingExp = ref<Experience | null>(null)
const expForm = reactive({ company: '', role: '', startDate: '', endDate: '', description: '', isCurrent: false })

function openExpModal(exp?: Experience) {
  if (exp) {
    editingExp.value = exp
    expForm.company = exp.company
    expForm.role = exp.role
    expForm.startDate = exp.startDate
    expForm.endDate = exp.endDate ?? ''
    expForm.description = exp.description ?? ''
    expForm.isCurrent = exp.isCurrent
  } else {
    editingExp.value = null
    expForm.company = ''
    expForm.role = ''
    expForm.startDate = ''
    expForm.endDate = ''
    expForm.description = ''
    expForm.isCurrent = false
  }
  expModalOpen.value = true
}

async function saveExperience() {
  saving.value = true
  try {
    const body = {
      ...expForm,
      endDate: expForm.endDate || null,
      description: expForm.description || null,
    }
    if (editingExp.value) {
      await $fetch(`/api/profile/experience/${editingExp.value.id}`, { method: 'PUT', body })
      toast.add({ title: 'Experience updated', color: 'green' })
    } else {
      await $fetch('/api/profile/experience', { method: 'POST', body })
      toast.add({ title: 'Experience added', color: 'green' })
    }
    expModalOpen.value = false
    refreshExperience()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save experience', color: 'red' })
  } finally {
    saving.value = false
  }
}

// --- Education ---
const eduModalOpen = ref(false)
const editingEdu = ref<Education | null>(null)
const eduForm = reactive({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '', isCurrent: false })

function openEduModal(edu?: Education) {
  if (edu) {
    editingEdu.value = edu
    eduForm.institution = edu.institution
    eduForm.degree = edu.degree
    eduForm.fieldOfStudy = edu.fieldOfStudy ?? ''
    eduForm.startDate = edu.startDate
    eduForm.endDate = edu.endDate ?? ''
    eduForm.description = edu.description ?? ''
    eduForm.isCurrent = edu.isCurrent
  } else {
    editingEdu.value = null
    eduForm.institution = ''
    eduForm.degree = ''
    eduForm.fieldOfStudy = ''
    eduForm.startDate = ''
    eduForm.endDate = ''
    eduForm.description = ''
    eduForm.isCurrent = false
  }
  eduModalOpen.value = true
}

async function saveEducation() {
  saving.value = true
  try {
    const body = {
      ...eduForm,
      fieldOfStudy: eduForm.fieldOfStudy || null,
      endDate: eduForm.endDate || null,
      description: eduForm.description || null,
    }
    if (editingEdu.value) {
      await $fetch(`/api/profile/education/${editingEdu.value.id}`, { method: 'PUT', body })
      toast.add({ title: 'Education updated', color: 'green' })
    } else {
      await $fetch('/api/profile/education', { method: 'POST', body })
      toast.add({ title: 'Education added', color: 'green' })
    }
    eduModalOpen.value = false
    refreshEducation()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save education', color: 'red' })
  } finally {
    saving.value = false
  }
}

// --- Projects ---
const projectModalOpen = ref(false)
const editingProject = ref<Project | null>(null)
const techInput = ref('')
const projectForm = reactive({ name: '', description: '', url: '', repoUrl: '', techStack: [] as string[], isFeatured: false })

function openProjectModal(project?: Project) {
  if (project) {
    editingProject.value = project
    projectForm.name = project.name
    projectForm.description = project.description ?? ''
    projectForm.url = project.url ?? ''
    projectForm.repoUrl = project.repoUrl ?? ''
    projectForm.techStack = [...project.techStack]
    projectForm.isFeatured = project.isFeatured
  } else {
    editingProject.value = null
    projectForm.name = ''
    projectForm.description = ''
    projectForm.url = ''
    projectForm.repoUrl = ''
    projectForm.techStack = []
    projectForm.isFeatured = false
  }
  techInput.value = ''
  projectModalOpen.value = true
}

function addTech() {
  const tech = techInput.value.trim()
  if (tech && !projectForm.techStack.includes(tech)) {
    projectForm.techStack.push(tech)
  }
  techInput.value = ''
}

async function saveProject() {
  saving.value = true
  try {
    const body = {
      ...projectForm,
      description: projectForm.description || null,
      url: projectForm.url || null,
      repoUrl: projectForm.repoUrl || null,
    }
    if (editingProject.value) {
      await $fetch(`/api/profile/projects/${editingProject.value.id}`, { method: 'PUT', body })
      toast.add({ title: 'Project updated', color: 'green' })
    } else {
      await $fetch('/api/profile/projects', { method: 'POST', body })
      toast.add({ title: 'Project added', color: 'green' })
    }
    projectModalOpen.value = false
    refreshProjects()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save project', color: 'red' })
  } finally {
    saving.value = false
  }
}

// --- Links ---
const linkModalOpen = ref(false)
const editingLink = ref<Link | null>(null)
const linkForm = reactive({ label: '', url: '', icon: '', position: 0 })

function openLinkModal(link?: Link) {
  if (link) {
    editingLink.value = link
    linkForm.label = link.label
    linkForm.url = link.url
    linkForm.icon = link.icon ?? ''
    linkForm.position = link.position
  } else {
    editingLink.value = null
    linkForm.label = ''
    linkForm.url = ''
    linkForm.icon = ''
    linkForm.position = 0
  }
  linkModalOpen.value = true
}

async function saveLink() {
  saving.value = true
  try {
    const body = {
      ...linkForm,
      icon: linkForm.icon || null,
    }
    if (editingLink.value) {
      await $fetch(`/api/profile/links/${editingLink.value.id}`, { method: 'PUT', body })
      toast.add({ title: 'Link updated', color: 'green' })
    } else {
      await $fetch('/api/profile/links', { method: 'POST', body })
      toast.add({ title: 'Link added', color: 'green' })
    }
    linkModalOpen.value = false
    refreshLinks()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save link', color: 'red' })
  } finally {
    saving.value = false
  }
}

// --- Goals ---
const goalModalOpen = ref(false)
const editingGoal = ref<Goal | null>(null)
const goalForm = reactive({ title: '', description: '', status: 'not_started', targetDate: '', category: '' })

function openGoalModal(goal?: Goal) {
  if (goal) {
    editingGoal.value = goal
    goalForm.title = goal.title
    goalForm.description = goal.description ?? ''
    goalForm.status = goal.status
    goalForm.targetDate = goal.targetDate ?? ''
    goalForm.category = goal.category ?? ''
  } else {
    editingGoal.value = null
    goalForm.title = ''
    goalForm.description = ''
    goalForm.status = 'not_started'
    goalForm.targetDate = ''
    goalForm.category = ''
  }
  goalModalOpen.value = true
}

async function saveGoal() {
  saving.value = true
  try {
    const body = {
      ...goalForm,
      description: goalForm.description || null,
      targetDate: goalForm.targetDate || null,
      category: goalForm.category || null,
    }
    if (editingGoal.value) {
      await $fetch(`/api/profile/goals/${editingGoal.value.id}`, { method: 'PUT', body })
      toast.add({ title: 'Goal updated', color: 'green' })
    } else {
      await $fetch('/api/profile/goals', { method: 'POST', body })
      toast.add({ title: 'Goal added', color: 'green' })
    }
    goalModalOpen.value = false
    refreshGoals()
  } catch (e: any) {
    toast.add({ title: e.data?.statusMessage || 'Failed to save goal', color: 'red' })
  } finally {
    saving.value = false
  }
}

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
  link: 'links',
  goal: 'goals',
}

const deleteRefreshers: Record<string, () => void> = {
  skill: () => refreshSkills(),
  experience: () => refreshExperience(),
  project: () => refreshProjects(),
  education: () => refreshEducation(),
  link: () => refreshLinks(),
  goal: () => refreshGoals(),
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

// Helpers
function formatDateRange(start: string, end: string | null): string {
  const fmt = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  return `${fmt(start)} - ${end ? fmt(end) : 'Present'}`
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function goalStatusClass(status: string): string {
  const classes: Record<string, string> = {
    in_progress: 'bg-blue-500/10 text-blue-400',
    completed: 'bg-green-500/10 text-green-400',
    not_started: 'bg-zinc-700/50 text-zinc-400',
  }
  return classes[status] ?? classes.not_started
}

function goalStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    in_progress: 'In Progress',
    completed: 'Completed',
    not_started: 'Not Started',
  }
  return labels[status] ?? status
}
</script>
