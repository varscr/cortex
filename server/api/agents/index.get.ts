export default defineEventHandler(async () => {
  const names = await listAgents()
  const agents = await Promise.all(
    names.map(async (name) => {
      const config = await loadAgentConfig(name)
      return {
        name: config.name,
        description: config.description,
        provider: config.model.provider,
        model: config.model.model,
      }
    })
  )
  return { agents }
})
