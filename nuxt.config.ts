export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-01-01',
  modules: ['@nuxt/ui', '@nuxtjs/google-fonts'],
  colorMode: {
    preference: 'dark'
  },
  css: ['~/assets/css/main.css'],
  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700]
    }
  }
})
