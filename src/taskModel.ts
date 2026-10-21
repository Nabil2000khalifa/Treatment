export const MAX_TITLE_LENGTH = 100
export const MAX_DESCRIPTION_LENGTH = 500

export type Task = {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export type TaskDraft = {
  title: string
  description: string
}

export type TaskFilter = 'all' | 'active' | 'completed'

export type ValidationResult =
  | { valid: true; draft: TaskDraft }
  | { valid: false; message: string }

export function validateTaskDraft(input: TaskDraft): ValidationResult {
  const title = input.title.trim()
  const description = input.description.trim()

  if (!title) {
    return { valid: false, message: 'Enter a title before saving the task.' }
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { valid: false, message: `Titles must be ${MAX_TITLE_LENGTH} characters or fewer.` }
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { valid: false, message: `Descriptions must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.` }
  }
  return { valid: true, draft: { title, description } }
}

export function createTask(draft: TaskDraft, now: string, id: string): Task {
  return { ...draft, id, completed: false, createdAt: now, updatedAt: now }
}

export function filterTasks(tasks: Task[], filter: TaskFilter, search: string): Task[] {
  const normalizedSearch = search.trim().toLocaleLowerCase()
  return tasks.filter((task) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && !task.completed) ||
      (filter === 'completed' && task.completed)
    const matchesSearch =
      !normalizedSearch || task.title.toLocaleLowerCase().includes(normalizedSearch)
    return matchesFilter && matchesSearch
  })
}

export function getTaskCounts(tasks: Task[]) {
  const completed = tasks.filter((task) => task.completed).length
  return { total: tasks.length, active: tasks.length - completed, completed }
}

export function parseStoredTasks(value: string | null): Task[] {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter(isTask) : []
  } catch {
    return []
  }
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const task = value as Record<string, unknown>
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'string' &&
    typeof task.updatedAt === 'string'
  )
}
