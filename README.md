# MiniTask

MiniTask is a small, client-only task manager built for the treatment condition of
the engineering-skills benchmark. Tasks are persisted in browser localStorage.

## Requirements

- Node.js 24.14 or newer
- npm 11 or newer

## Commands

```bash
npm install
npm run dev       # start the local development server
npm test          # run the Vitest suite
npm run lint      # run ESLint
npm run build     # type-check and create a production build
npm run preview   # preview the production build
```

## Project structure

- `src/App.tsx` - accessible task-management interface and UI state
- `src/taskModel.ts` - typed task model, validation, filtering, counts, and safe parsing
- `src/taskStorage.ts` - localStorage adapter with explicit error results
- `src/*.test.*` - domain, persistence, and user workflow tests

The application has no backend, authentication, external APIs, or secrets.
See [IMPLEMENTATION_REPORT.md](./IMPLEMENTATION_REPORT.md) for architecture and
security decisions, and [TEST_RESULTS.md](./TEST_RESULTS.md) for observed
validation evidence.
