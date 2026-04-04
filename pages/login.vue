<template>
  <div class="linear-bg min-h-screen flex items-center justify-center px-4">
    <div class="linear-panel rounded-xl p-8 w-full max-w-sm">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-semibold text-white">Cortex</h1>
        <p class="text-sm text-zinc-400 mt-1">Sign in to continue</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
          <UInput
            v-model="email"
            type="email"
            placeholder="you@example.com"
            color="gray"
            variant="outline"
            size="lg"
            :disabled="loading"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
          <UInput
            v-model="password"
            type="password"
            placeholder="Enter your password"
            color="gray"
            variant="outline"
            size="lg"
            :disabled="loading"
          />
        </div>

        <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

        <UButton
          type="submit"
          color="white"
          size="lg"
          block
          :loading="loading"
          label="Sign in"
        />
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    const { error: authError } = await signIn.email({
      email: email.value,
      password: password.value,
    })

    if (authError) {
      error.value = authError.message || 'Invalid credentials'
      return
    }

    await navigateTo('/')
  } catch (e) {
    console.error('Login error:', e)
    error.value = 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
