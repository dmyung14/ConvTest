# PROGRESS — DecisionTrace

Independent prototype prepared for a Convexia conversation. Built milestone-by-milestone
against `convexiaevidencedemobuildbrief.md`.

**Package manager:** npm
**Core commands:** `npm run dev` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run test:e2e` · `npm run build` · `npm run verify`

---

## Milestone 0 — Inspect and establish the project ✅

**Completed**

- Inspected `/home/user/ConvTest`: git repository for `dmyung14/ConvTest` with no commits and no prior files, so nothing to preserve.
- Scaffolded a Next.js 16.3.4 App Router app (React 19.2, TypeScript strict, Tailwind CSS v4, ESLint flat config, `src/` dir, `@/*` alias) with npm.
- Read the generated `AGENTS.md` (Next 16 agent rules) and the bundled Next 16 upgrade/breaking-change docs in `node_modules/next/dist/docs/`.
- Added dependencies: `zod`, `lucide-react`.
- Added dev tooling: `vitest` + `@vitejs/plugin-react` + `jsdom` + Testing Library (unit/component tests), `@playwright/test` (e2e), `prettier`.
- Replaced `next/font/google` (Geist) with a system font stack so production builds never require network access.
- Established design tokens in `src/app/globals.css`: calm clinical palette (navy chrome, warm off-white canvas, deep teal accent, amber for uncertainty, red reserved for contradictions), global focus-visible ring, `prefers-reduced-motion` handling, and print styles.
- Added npm scripts: `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `test`, `test:e2e`, `verify`.
- Created `PROGRESS.md`.

**Verification**

| Command | Result |
| --- | --- |
| `npm run lint` | pass (no warnings/errors) |
| `npm run typecheck` | pass |
| `npm run build` | pass — routes `/` and `/_not-found` prerendered static |
| `npm run dev` + `curl 127.0.0.1:3123` | dev server up in ~1s, page served |

**Known limitations**

- Landing page is a placeholder until Milestone 2.
- No domain model or fixture yet.

**Next milestone:** M1 — domain model, Zod schemas, illustrative fixture, coverage calculation + unit tests.
