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

| Command                               | Result                                                 |
| ------------------------------------- | ------------------------------------------------------ |
| `npm run lint`                        | pass (no warnings/errors)                              |
| `npm run typecheck`                   | pass                                                   |
| `npm run build`                       | pass — routes `/` and `/_not-found` prerendered static |
| `npm run dev` + `curl 127.0.0.1:3123` | dev server up in ~1s, page served                      |

**Known limitations**

- Landing page is a placeholder until Milestone 2.
- No domain model or fixture yet.

**Next milestone:** M1 — domain model, Zod schemas, illustrative fixture, coverage calculation + unit tests.

---

## Milestone 1 — Domain model and fixture ✅

**Completed**

- `src/domain/schema.ts` — Zod schemas and inferred TypeScript types for `Asset`, `Claim`, `EvidenceItem`, `CriticalUnknown`, `Recommendation`, `AuditEvent`, plus the four evidence classifications, five review states, confidence/impact levels and a closed `DiligenceDomain` enum. Two fields were added beyond the brief because the UI needs them: `Claim.decisionRelevance` (why the claim matters to the go/no-go) and `CriticalUnknown.linkedClaimIds` (so the unknowns panel can navigate to the claims it would change).
- `src/domain/coverage.ts` — the evidence-coverage calculation, documented in code with its exact formula and weights (`direct_support` 1.00, `model_inference` 0.50, `contradiction` 0.25, `missing_evidence` 0.00; percentage rounded half-up, empty claim set = 0%). Also derives classification/review-status/domain counts, a separate reviewed-percent, and an impact ranking for unknowns. Review progress is deliberately kept separate from coverage: reviewing a claim does not create evidence.
- `src/domain/labels.ts` — display metadata for every status token (label, short form, plain-language definition, chip classes) so status is always conveyed by text and never by colour alone; domain metadata; deterministic UTC timestamp formatting to avoid SSR/client hydration drift.
- `src/data/demo-asset.ts` — the illustrative fixture: `DTX-101 (illustrative)`, AAV gene replacement, illustrative monogenic neuromuscular disorder, preclinical/diligence candidate. 14 claims across all 5 domains (6 sourced, 4 inferred, 2 contradictions, 2 missing) with 18 evidence records, 5 decision-critical unknowns (3 high impact), and a 7-event audit trail spanning agent, system and human actors.
- `src/data/index.ts` — `getDemoAsset()` validates the fixture on read, so a malformed edit fails at the boundary rather than half-rendering.

**Fixture design notes**

- The asset is internally coherent rather than uniformly positive: strong human genetic causality, one load-bearing inference (the 30% expression threshold), a real contradiction in durability caused by two different assays, a seroprevalence conflict driven by assay thresholds, and no human exposure at all. The three high-impact unknowns follow from those facts.
- `clm-ops-02` is deliberately `direct_support` + `low` confidence, to show classification and confidence are independent axes.
- Coverage derives to exactly the 61% stated on the recommendation, and a unit test asserts the derived value equals the stated one, so the two can never silently diverge.

**Verification**

| Command | Result |
| --- | --- |
| `npm test` | pass — 34 tests across 2 files |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm run build` | pass |

Test coverage of note: coverage weights and rounding (including half-up boundary cases and the empty set), counter completeness, unknown ranking stability and non-mutation, and a set of scientific-safety assertions — fixture passes schema validation, every evidence item is `isIllustrative`, no `PMID`/`DOI`/`NCT`/`EudraCT`/`ISRCTN` string appears anywhere in the serialized fixture, illustrative evidence carries no URL, `missing_evidence` claims carry zero evidence while all others carry at least one, and every contradiction has at least one weakening record.

**Known limitations**

- The fixture is synthetic by design; it demonstrates the workflow, not any real asset.
- No UI consumes the model yet.

**Next milestone:** M2 — design system tokens, application shell and the landing route.
