import { describe, expect, it } from 'vitest'
import {
  filterTasks,
  getTaskCounts,
  MAX_TITLE_LENGTH,
  parseStoredTasks,
  validateTaskDraft,
  type Task,
} from './taskModel'

const tasks: Task[] = [
  { id: '1', title: 'Write tests', description: '', completed: false, createdAt: '', updatedAt: '' },
  { id: '2', title: 'Ship release', description: '', completed: true, createdAt: '', updatedAt: '' },
]

describe('task model', () => {
  it('trims input and rejects empty or overly long titles', () => {
    expect(validateTaskDraft({ title: '  Plan launch  ', description: '  details ' })).toEqual({
      valid: true,
      draft: { title: 'Plan launch', description: 'details' },
    })
    expect(validateTaskDraft({ title: '   ', description: '' }).valid).toBe(false)
    expect(validateTaskDraft({ title: 'x'.repeat(MAX_TITLE_LENGTH + 1), description: '' }).valid).toBe(false)
  })

  it('filters by status and title search', () => {
    expect(filterTasks(tasks, 'active', '')).toHaveLength(1)
    expect(filterTasks(tasks, 'completed', '')[0].title).toBe('Ship release')
    expect(filterTasks(tasks, 'all', 'WRITE')[0].id).toBe('1')
  })

  it('calculates total, active, and completed counts', () => {
    expect(getTaskCounts(tasks)).toEqual({ total: 2, active: 1, completed: 1 })
  })

  it('ignores malformed stored data without throwing', () => {
    expect(parseStoredTasks('{broken')).toEqual([])
    expect(parseStoredTasks(JSON.stringify([{ id: 'missing-fields' }]))).toEqual([])
  })

  it('keeps valid stored tasks and does not execute HTML-like text', () => {
    const task = { ...tasks[0], title: '<img src=x onerror=alert(1)>' }
    expect(parseStoredTasks(JSON.stringify([task]))[0].title).toContain('<img')
  })
})
