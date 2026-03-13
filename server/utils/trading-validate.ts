export function validateStrategyInput(body: any): { data?: StrategyInput; error?: string } {
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return { error: 'Strategy name is required' }
  }

  if (body.description !== undefined && body.description !== null && typeof body.description !== 'string') {
    return { error: 'Description must be a string' }
  }

  if (body.tags !== undefined && !Array.isArray(body.tags)) {
    return { error: 'Tags must be an array of strings' }
  }

  if (body.allocationUsd !== undefined && body.allocationUsd !== null && typeof body.allocationUsd !== 'number') {
    return { error: 'allocationUsd must be a number' }
  }

  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
    return { error: 'isActive must be a boolean' }
  }

  return {
    data: {
      name: body.name.trim(),
      description: body.description ?? null,
      tags: body.tags ?? [],
      allocationUsd: body.allocationUsd ?? null,
      isActive: body.isActive,
    },
  }
}
