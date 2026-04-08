import { upsertDocument, deleteDocument } from '../embed/core'

interface KanbanCardRow {
  id: number
  title: string
  description: string | null
  tags: string[] | null
  due_date: string | null
  color: string | null
  tasks: Array<{ id: string; name: string; finished: boolean }> | null
  created_at: string
}

function buildEmbedText(row: KanbanCardRow): string {
  const lines: string[] = []

  lines.push(`[kanban] ${row.title}`)

  if (row.description) {
    lines.push(row.description)
  }

  if (row.tags?.length) {
    lines.push(`Tags: ${row.tags.join(', ')}`)
  }

  if (row.due_date) {
    lines.push(`Due: ${row.due_date}`)
  }

  if (row.color) {
    lines.push(`Color: ${row.color}`)
  }

  if (row.tasks?.length) {
    const done = row.tasks.filter(t => t.finished).length
    lines.push(`Tasks (${done}/${row.tasks.length} done):`)
    for (const task of row.tasks) {
      lines.push(`  ${task.finished ? '[x]' : '[ ]'} ${task.name}`)
    }
  }

  return lines.join('\n')
}

export async function upsertKanbanEmbedding(row: KanbanCardRow, userId: string): Promise<void> {
  const tasks = row.tasks ?? []
  await upsertDocument(`kanban/${row.id}`, 'kanban', buildEmbedText(row), {
    title: row.title,
    tags: row.tags ?? [],
    dueDate: row.due_date,
    color: row.color,
    tasksTotal: tasks.length,
    tasksDone: tasks.filter(t => t.finished).length,
  }, userId)
}

export async function deleteKanbanEmbedding(cardId: number, userId: string): Promise<void> {
  await deleteDocument(`kanban/${cardId}`, userId)
}
