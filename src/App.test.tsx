import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  window.localStorage.clear()
  let id = 0
  vi.stubGlobal('crypto', { randomUUID: () => `test-id-${id++}` })
  vi.stubGlobal('confirm', () => true)
})

describe('MiniTask workflows', () => {
  it('creates a task and trims whitespace', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Title'), '  Buy milk  ')
    await user.type(screen.getByLabelText(/Description/), '  from the store ')
    await user.click(screen.getByRole('button', { name: 'Create task' }))
    expect(screen.getByRole('heading', { name: 'Buy milk' })).toBeInTheDocument()
    expect(screen.getByText('from the store')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Task created.')
  })

  it('rejects an empty title and long input', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Create task' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a title')
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'x'.repeat(101) } })
    await user.click(screen.getByRole('button', { name: 'Create task' }))
    expect(screen.getByRole('alert')).toHaveTextContent('100 characters')
  })

  it('edits, completes, reopens, and deletes a task after confirmation', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Title'), 'Draft')
    await user.click(screen.getByRole('button', { name: 'Create task' }))
    await user.click(screen.getByRole('button', { name: 'Edit Draft' }))
    await user.clear(screen.getByLabelText('Title'))
    await user.type(screen.getByLabelText('Title'), 'Published')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByRole('heading', { name: 'Published' })).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: /Mark Published as completed/ }))
    expect(screen.getByText('Task completed.')).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: /Mark Published as active/ }))
    await user.click(screen.getByRole('button', { name: 'Delete Published' }))
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Published' })).not.toBeInTheDocument())
  })

  it('filters and searches tasks and shows counts', async () => {
    const user = userEvent.setup()
    render(<App />)
    for (const title of ['Read book', 'Write code']) {
      await user.type(screen.getByLabelText('Title'), title)
      await user.click(screen.getByRole('button', { name: 'Create task' }))
    }
    expect(screen.getByLabelText('Task counts')).toHaveTextContent('2 total')
    await user.click(screen.getByRole('checkbox', { name: /Mark Read book as completed/ }))
    await user.click(screen.getByRole('button', { name: /completed/i }))
    expect(screen.getByRole('heading', { name: 'Read book' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Write code' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^all$/i }))
    await user.type(screen.getByLabelText('Search tasks by title'), 'code')
    expect(screen.getByRole('heading', { name: 'Write code' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Read book' })).not.toBeInTheDocument()
  })

  it('restores tasks after a remount and renders text safely', async () => {
    const user = userEvent.setup()
    const first = render(<App />)
    await user.type(screen.getByLabelText('Title'), '<script>alert(1)</script>')
    await user.click(screen.getByRole('button', { name: 'Create task' }))
    expect(screen.getByRole('heading', { name: '<script>alert(1)</script>' })).toBeInTheDocument()
    first.unmount()
    render(<App />)
    expect(await screen.findByRole('heading', { name: '<script>alert(1)</script>' })).toBeInTheDocument()
  })
})
