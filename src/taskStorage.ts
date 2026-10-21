import { parseStoredTasks, type Task } from './taskModel'

export const TASKS_STORAGE_KEY = 'minitask.tasks.v1'

export type StorageResult =
  | { ok: true; tasks: Task[] }
  | { ok: false; message: string }

export function loadTasks(storage: Storage): StorageResult {
  try {
    return { ok: true, tasks: parseStoredTasks(storage.getItem(TASKS_STORAGE_KEY)) }
  } catch {
    return { ok: false, message: 'Tasks could not be loaded. Check browser storage permissions.' }
  }
}

export function saveTasks(storage: Storage, tasks: Task[]): StorageResult {
  try {
    storage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
    return { ok: true, tasks }
  } catch {
    return { ok: false, message: 'Tasks could not be saved. Check available browser storage.' }
  }
}
