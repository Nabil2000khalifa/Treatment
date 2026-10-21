import { useMemo, useState } from 'react'
import {
  createTask,
  filterTasks,
  getTaskCounts,
  validateTaskDraft,
  type Task,
  type TaskDraft,
  type TaskFilter,
} from './taskModel'
import { loadTasks, saveTasks } from './taskStorage'

const emptyDraft: TaskDraft = { title: '', description: '' }

function App() {
  const initialState = useState(() => {
    const result = loadTasks(window.localStorage)
    return result.ok
      ? { tasks: result.tasks, error: '' }
      : { tasks: [] as Task[], error: result.message }
  })[0]
  const [tasks, setTasks] = useState<Task[]>(initialState.tasks)
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState(initialState.error)

  const visibleTasks = useMemo(() => filterTasks(tasks, filter, search), [tasks, filter, search])
  const counts = useMemo(() => getTaskCounts(tasks), [tasks])

  function persist(nextTasks: Task[]): boolean {
    const result = saveTasks(window.localStorage, nextTasks)
    if (!result.ok) {
      setError(result.message)
      return false
    }
    setTasks(nextTasks)
    return true
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    const result = validateTaskDraft(draft)
    if (!result.valid) {
      setError(result.message)
      return
    }
    const now = new Date().toISOString()
    const nextTasks = editingId
      ? tasks.map((task) => task.id === editingId ? { ...task, ...result.draft, updatedAt: now } : task)
      : [createTask(result.draft, now, crypto.randomUUID()), ...tasks]
    if (persist(nextTasks)) {
      setDraft(emptyDraft)
      setEditingId(null)
      setMessage(editingId ? 'Task updated.' : 'Task created.')
    }
  }

  function startEditing(task: Task) {
    setDraft({ title: task.title, description: task.description })
    setEditingId(task.id)
    setError('')
    setMessage('')
    document.getElementById('task-title')?.focus()
  }

  function toggleTask(task: Task) {
    const nextTasks = tasks.map((item) => item.id === task.id
      ? { ...item, completed: !item.completed, updatedAt: new Date().toISOString() }
      : item)
    if (persist(nextTasks)) setMessage(task.completed ? 'Task reopened.' : 'Task completed.')
  }

  function removeTask(task: Task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return
    if (persist(tasks.filter((item) => item.id !== task.id))) setMessage('Task deleted.')
  }

  function cancelEditing() {
    setDraft(emptyDraft)
    setEditingId(null)
    setError('')
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">MiniTask</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Make progress visible.</h1>
          <p className="mt-3 max-w-xl text-slate-400">A focused task list that stays with you in this browser.</p>
        </header>
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.4fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <h2 className="text-xl font-semibold">{editingId ? 'Edit task' : 'Add a task'}</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="task-title" className="mb-2 block text-sm font-medium text-slate-300">Title</label>
                <input id="task-title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} maxLength={100} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30" placeholder="What needs doing?" />
              </div>
              <div>
                <label htmlFor="task-description" className="mb-2 block text-sm font-medium text-slate-300">Description <span className="font-normal text-slate-500">(optional)</span></label>
                <textarea id="task-description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} maxLength={500} rows={4} className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30" placeholder="Add a little context..." />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="submit" className="rounded-lg bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900">{editingId ? 'Save changes' : 'Create task'}</button>
              {editingId && <button type="button" onClick={cancelEditing} className="rounded-lg border border-slate-700 px-4 py-2.5 font-medium text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400">Cancel</button>}
            </div>
          </form>
          <section aria-labelledby="tasks-heading" className="min-w-0">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="tasks-heading" className="text-2xl font-semibold">Your tasks</h2>
                <div className="mt-2 flex gap-4 text-sm text-slate-400" aria-label="Task counts">
                  <span><strong className="text-slate-100">{counts.total}</strong> total</span>
                  <span><strong className="text-cyan-400">{counts.active}</strong> active</span>
                  <span><strong className="text-emerald-400">{counts.completed}</strong> done</span>
                </div>
              </div>
              <label className="sr-only" htmlFor="task-search">Search tasks by title</label>
              <input id="task-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks..." className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 sm:w-48" />
            </div>
            <div className="mb-4 flex gap-2" role="group" aria-label="Filter tasks">
              {(['all', 'active', 'completed'] as const).map((option) => <button key={option} type="button" onClick={() => setFilter(option)} aria-pressed={filter === option} className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize focus:outline-none focus:ring-2 focus:ring-cyan-400 ${filter === option ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{option}</button>)}
            </div>
            {message && <p role="status" className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{message}</p>}
            {error && <p role="alert" className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}
            {visibleTasks.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center"><p className="text-lg font-medium">{tasks.length === 0 ? 'Nothing here yet' : 'No matching tasks'}</p><p className="mt-1 text-sm text-slate-500">{tasks.length === 0 ? 'Create your first task to get started.' : 'Try a different search or filter.'}</p></div>
              : <ul className="space-y-3">{visibleTasks.map((task) => <li key={task.id} className={`rounded-2xl border border-slate-800 bg-slate-900 p-4 ${task.completed ? 'opacity-70' : ''}`}><div className="flex items-start gap-3"><input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} aria-label={`Mark ${task.title} as ${task.completed ? 'active' : 'completed'}`} className="mt-1 size-5 accent-cyan-400 focus:ring-2 focus:ring-cyan-400" /><div className="min-w-0 flex-1"><h3 className={`font-semibold ${task.completed ? 'text-slate-400 line-through' : 'text-slate-100'}`}>{task.title}</h3>{task.description && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-400">{task.description}</p>}</div><div className="flex shrink-0 gap-1"><button type="button" onClick={() => startEditing(task)} aria-label={`Edit ${task.title}`} className="rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-800 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400">Edit</button><button type="button" onClick={() => removeTask(task)} aria-label={`Delete ${task.title}`} className="rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-800 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-cyan-400">Delete</button></div></div></li>)}</ul>}
          </section>
        </section>
      </div>
    </main>
  )
}

export default App
