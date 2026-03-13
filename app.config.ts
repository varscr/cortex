export default defineAppConfig({
  ui: {
    primary: 'zinc',
    gray: 'zinc',
    card: {
      background: 'bg-zinc-900/40',
      ring: 'ring-1 ring-white/5',
      rounded: 'rounded-xl',
      shadow: 'shadow-sm',
      body: {
        padding: 'p-6 sm:p-6',
      },
      header: {
        padding: 'px-6 py-5 sm:px-6',
      }
    },
    button: {
      rounded: 'rounded-md',
      default: {
        size: 'sm',
      }
    }
  }
})
