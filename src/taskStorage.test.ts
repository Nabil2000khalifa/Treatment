import { describe, expect, it } from 'vitest'
import { loadTasks, saveTasks, TASKS_STORAGE_KEY } from './taskStorage'

describe('task storage', () => {
  it('persists and loads task data', () => {
    const storage = window.localStorage
    const tasks = [{ id: '1', title: 'Task', description: '', completed: false, createdAt: '', updatedAt: '' }]
    expect(saveTasks(storage, tasks).ok).toBe(true)
    expect(loadTasks(storage)).toEqual({ ok: true, tasks })
    expect(storage.getItem(TASKS_STORAGE_KEY)).toContain('"title":"Task"')
  })

  it('returns useful errors when storage access fails', () => {
    const storage = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') },
    } as unknown as Storage
    expect(loadTasks(storage).ok).toBe(false)
    expect(saveTasks(storage, []).ok).toBe(false)
  })
})
