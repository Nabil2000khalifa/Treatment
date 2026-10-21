# MiniTask Implementation Report

## Benchmark condition

This is the **treatment** implementation. The applicable `architecture-first`,
`engineering-standards`, `fresh-knowledge`, `readable-code`,
`secure-by-default`, and `upgradable-code` skills from the local
`engineering-skills` repository were loaded and applied. The other experimental
condition was not inspected or modified.

## Architecture and design decisions

- `src/taskModel.ts` owns the pure task type, validation, normalization,
  filtering, counting, and malformed-data parsing.
- `src/taskStorage.ts` is the narrow localStorage seam. It returns explicit
  success/error results instead of hiding storage failures.
- `src/App.tsx` owns presentation and interaction state, and calls the domain
  and storage modules rather than duplicating their rules.
- localStorage is synchronous, so initial data is read through a lazy state
  initializer. There is no artificial loading delay; empty and error states are
  shown where applicable.
- User text is rendered as React text and is never passed to an HTML injection
  API.

## Project structure

```text
src/
  App.tsx
  App.test.tsx
  index.css
  main.tsx
  taskModel.ts
  taskModel.test.ts
  taskStorage.ts
  taskStorage.test.ts
  testSetup.ts
```

## Dependencies

- React and React DOM: UI rendering.
- Vite and `@vitejs/plugin-react`: development server and production bundling.
- TypeScript: explicit task and storage types.
- Tailwind CSS and `@tailwindcss/vite`: small, consistent responsive visual
  design without a component dependency.
- Vitest, jsdom, Testing Library, and user-event: behavior-level tests.
- ESLint, the TypeScript parser, React Hooks, React Refresh, and globals:
  linting and React-specific correctness checks.

Versions are pinned through `package-lock.json`. Registry checks were performed
before installation. ESLint 9.39.5 was selected because the current React Hooks
plugin peer range does not accept ESLint 10. The installed jsdom release reports
an engine requirement of Node 24.15+, while this environment is Node 24.14;
tests still ran successfully, but upgrading Node is recommended.

## Validation and security measures

- Titles are trimmed, required, and capped at 100 characters.
- Descriptions are trimmed and capped at 500 characters.
- Stored JSON is parsed defensively; invalid shapes are ignored.
- Storage read/write exceptions become useful user-facing error messages.
- React's escaped text rendering prevents HTML-like task text from executing.
- Delete requires browser confirmation.
- Forms have labels, keyboard-operable controls, visible focus rings, status and
  alert regions, semantic headings, and responsive layout.
- `npm audit --audit-level=high` reported zero vulnerabilities.

## Known limitations

- Tasks are local to one browser profile and are not synchronized.
- Browser privacy settings or quota exhaustion can prevent persistence.
- IDs use `crypto.randomUUID()`, which is available in supported modern browsers.
- The heuristic security scanner reports two false positives for ordinary
  template literals in `App.tsx`; there is no SQL or shell execution in this
  application.

## Deviations

- No backend, authentication, external APIs, payments, AI, or collaboration
  features were added.
- The requested loading state is not displayed during persistence because
  localStorage is synchronous and completes within the current event; loading,
  empty, validation, and storage-error states are still handled.

