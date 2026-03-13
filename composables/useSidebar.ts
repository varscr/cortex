export const useSidebar = () => {
  const stored = import.meta.client ? localStorage.getItem('sidebar-collapsed') : null
  const isCollapsed = ref(stored === 'true')

  watch(isCollapsed, (val) => {
    localStorage.setItem('sidebar-collapsed', String(val))
  })

  const toggle = () => { isCollapsed.value = !isCollapsed.value }

  return { isCollapsed, toggle }
}
