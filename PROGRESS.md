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

| Command             | Result                         |
| ------------------- | ------------------------------ |
| `npm test`          | pass — 34 tests across 2 files |
| `npm run lint`      | pass                           |
| `npm run typecheck` | pass                           |
| `npm run build`     | pass                           |

Test coverage of note: coverage weights and rounding (including half-up boundary cases and the empty set), counter completeness, unknown ranking stability and non-mutation, and a set of scientific-safety assertions — fixture passes schema validation, every evidence item is `isIllustrative`, no `PMID`/`DOI`/`NCT`/`EudraCT`/`ISRCTN` string appears anywhere in the serialized fixture, illustrative evidence carries no URL, `missing_evidence` claims carry zero evidence while all others carry at least one, and every contradiction has at least one weakening record.

**Known limitations**

- The fixture is synthetic by design; it demonstrates the workflow, not any real asset.
- No UI consumes the model yet.

**Next milestone:** M2 — design system tokens, application shell and the landing route.

---

## Milestone 2 — Design system and application shell ✅

**Completed**

- Design tokens (established in M0, now consumed everywhere): warm off-white canvas `#f7f6f3`, near-black navy chrome `#0e1620`, deep teal accent `#0f5c56`, amber `#8a5a08` for uncertainty, red `#97231f` reserved strictly for contradictions and rejections, blue-gray `#465569` for neutral metadata. Exposed to Tailwind v4 through `@theme inline`.
- `src/components/ui/index.tsx` — `Badge`, `Card`/`CardHeader`, `Button`/`ButtonLink` (primary/secondary/ghost/danger), `EmptyState`, `DefinitionItem`, `Meter`. The meter renders `role="meter"` with aria values and always sits beside the number as text, so it decorates a figure rather than replacing one.
- `src/components/layout/AppShell.tsx` — dark sticky header with the DecisionTrace wordmark, the "Independent prototype prepared for a Convexia conversation" label, a footer carrying all three disclaimers (independent prototype / illustrative data / no medical, regulatory or investment advice), and a skip-to-content link.
- `src/components/layout/IllustrativeBanner.tsx` — the persistent "Illustrative evidence" banner, placed above the workspace rather than in a footer.
- Landing route `/` — value proposition, "Open demonstration asset" primary action, five derived headline figures (claims, coverage, contradictions, claims with no evidence, high-impact unknowns — all computed from the fixture, none typed by hand), three benefit cards (traceability, contradiction detection, expert escalation), and the illustrative-data disclaimer. Deliberately short: the interactive demo is one click away.

**Verification**

| Command                         | Result                                          |
| ------------------------------- | ----------------------------------------------- |
| `npm run lint`                  | pass                                            |
| `npm run typecheck`             | pass                                            |
| `npm run build`                 | pass                                            |
| `npm test`                      | pass — 34 tests                                 |
| Rendered screenshot at 1440×900 | clean hierarchy, no overflow                    |
| Rendered screenshot at 390×844  | single column, no clipping or horizontal scroll |

Screenshots were captured against `npm run start` with headless Chromium (`/opt/pw-browsers/chromium-1194`, launched with background networking disabled so the page settles offline).

**Known limitations**

- The header's prototype label is hidden below `lg` to protect the mobile layout; the same text remains in the footer at every width.
- Links to `/assets/demo-asset` and `/methodology` 404 until M3 and the optional methodology route land, which shows up as two prefetch 404s in the console.

**Next milestone:** M3 — the asset decision workspace: header, decision summary, domain navigation and the filterable claim matrix.

---

## Milestone 3 — Asset decision workspace ✅

**Completed**

- Route `/assets/[assetId]` (Next 16 async `params`, `generateStaticParams` for the demo asset, `notFound()` for anything else) — statically prerendered as `/assets/demo-asset`.
- `src/state/workspace-store.ts` — the review state layer. Built on `useSyncExternalStore` rather than seeding state from an effect: the server snapshot is the pristine fixture and React swaps in the persisted snapshot after hydration, so there is no hydration mismatch and no `set-state-in-effect`. Only reviewer mutations are persisted; the fixture stays authoritative, and applying mutations never mutates the fixture object.
- `AssetHeader` — name, illustrative badge, indication, modality, stage, owner/status, last evidence refresh (UTC, deterministic formatting).
- `DecisionSummary` — provisional recommendation with its rationale, an explicit "generated by agents, not yet adjudicated by a human" qualifier, the confidence label _and_ its explanation, the coverage meter with the number always shown as text beside it, the four classification counts, and the three highest-impact unknowns.
- `DomainNav` — five diligence domains plus "All domains", each with its derived claim count and `aria-pressed` state.
- `ClaimMatrix` — a real table at `lg` and above (claim, evidence type, record count, confidence, reviewer type, review state, last reviewed) and stacked cards below it, so the density survives a narrow window instead of scrolling off-screen.
- `ClaimFilterBar` — classification and review-status filters with live counts in the option labels, an `aria-live` result count, and a clear-filters action that appears only when a filter is active.

**Honest-counts rule**

Every number on this screen — domain tab counts, classification counts, coverage, filter option counts, the "showing N of M" line — comes from `summarizeAsset()` over the current claim list. Nothing is written twice. A unit test asserts the derived coverage equals the value stated on the recommendation, so a fixture edit that desynchronises them fails the build rather than shipping a lie.

**Verification**

| Command                          | Result                                                               |
| -------------------------------- | -------------------------------------------------------------------- |
| `npm test`                       | pass — 47 tests across 3 files (13 new for filtering and the matrix) |
| `npm run lint`                   | pass                                                                 |
| `npm run typecheck`              | pass                                                                 |
| `npm run build`                  | pass — `/assets/demo-asset` prerendered (SSG)                        |
| Rendered screenshot at 1440×1100 | full workspace, no console errors, no overflow                       |

New tests cover: each filter axis independently, conjunctive combination, an explicit assertion that every claim is reachable through some domain filter (nothing is hidden), active-filter counting, the filter bar's emitted values and conditional clear action, one table row per claim, click-to-select, the em-dash-not-zero treatment for claims with no evidence, and the empty-result explanation.

**Known limitations**

- Selecting a claim currently only highlights the row; the evidence drawer lands in M4.
- Review controls and the audit trail land in M5, so review state is still uniformly "Unreviewed".

**Next milestone:** M4 — the evidence drawer.

---

## Milestone 4 — Evidence inspection ✅

**Completed**

- `src/components/ui/Drawer.tsx` — a reusable right-side modal drawer with a real accessibility contract: `role="dialog"`, `aria-modal`, `aria-labelledby` pointing at the claim text, focus moved into the panel on open, focus **returned to the triggering row** on close, Tab trapped inside the panel in both directions, Escape to close, click-outside to close, and background scroll locked while open. Open/slide animation is `motion-safe` only, so `prefers-reduced-motion` users get an instant panel.
- `src/components/workspace/EvidenceDrawer.tsx` — the claim inspection view:
  - Status row (classification, confidence, review state, last reviewed) — every one rendered as text.
  - A **classification callout** at the top that states, before any source is read, whether what follows is a sourced fact, a model's reasoning, an unresolved conflict, or nothing at all.
  - "Why this matters to the decision", then the full confidence _rationale_ rather than a bare level.
  - Evidence grouped with **conflicting records shown first**, then supporting, then context — a reviewer should meet the disagreement before the reassurance.
  - Each record shows title, publisher, source type, publication date, normalized summary, and its supports/weakens/context relationship.
  - Linked decision-critical unknowns, and the claim's review history.

**How the four evidence states stay distinguishable**

- `direct_support` — teal, "Sourced fact", records shown as support.
- `model_inference` — slate, "Model inference", plus an explicit note when the attached records are context for the reasoning rather than support for the claim itself.
- `contradiction` — red, "Contradiction", conflicting records surfaced above everything else.
- `missing_evidence` — amber, a dashed panel reading "No evidence records" that states the gap has not been filled with an inference and contributes zero to coverage. The claim matrix shows an em dash rather than a `0` for these.

**Illustrative-vs-verified rule**

Every illustrative record carries an amber "Illustrative record — not a real citation" badge and **no link at all**. A link and a "Verified source" badge appear only when a record has `isIllustrative: false` _and_ a URL — i.e. only for something an adapter actually retrieved. A test constructs such a record and asserts the link renders with `rel="noopener noreferrer"`; another asserts the fixture's illustrative records produce zero links.

**Verification**

| Command                                | Result                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm test`                             | pass — 64 tests across 4 files (17 new for the drawer)                                                                                                                                                                                                                                                                   |
| `npm run lint`                         | pass                                                                                                                                                                                                                                                                                                                     |
| `npm run typecheck`                    | pass                                                                                                                                                                                                                                                                                                                     |
| `npm run build`                        | pass                                                                                                                                                                                                                                                                                                                     |
| Live browser check (headless Chromium) | filter → 2 of 14 claims; drawer opens with `aria-modal="true"` and a labelled heading; focus lands inside the panel; conflicting-evidence section present; 2 illustrative badges and 0 links; **Escape closes and focus returns to the originating row**; the missing-evidence claim shows the gap panel and its wording |

One issue found and resolved during verification: the first screenshots showed a see-through panel. That was the 160 ms open animation still running at capture time, not a styling bug — confirmed by re-capturing after the animation settles. A second issue was real but environmental: a stale `next-server` process kept port 3100 and served HTML referencing chunk hashes from an older build, which looked exactly like broken hydration. The local server helper now kills by process rather than by PID file.

**Known limitations**

- The drawer has no review controls yet; those land in M5 through its `footer` slot.

**Next milestone:** M5 — expert review actions, rationale capture, audit trail and reset.

---

## Milestone 5 — Expert review and auditability ✅

**Completed**

- `ReviewControls` (rendered in the drawer's footer slot) — the four review actions: verified, needs specialist, rejected, superseded, plus "Clear review state" for a claim already acted on. The parent keys the component by claim id so switching claims remounts it, rather than carrying a half-typed rationale across to a different claim.
- **Graduated rationale policy.** Rejecting or superseding a claim overrides the evidence on record, so a rationale of at least 8 characters is _required_ and enforced with a `role="alert"` message and `aria-invalid` on the field. Verifying or escalating follows from the evidence, so a rationale is invited but optional — an audit trail full of compulsory boilerplate is no better than an empty one. Where a reviewer does leave it blank, the audit event says so explicitly rather than inventing a reason.
- `AuditTrail` — every ingestion, classification and review event, newest first, each with a text actor-type label (Agent / System / Human), the actor, the action, the rationale and a UTC timestamp. Human review events are appended live and name the claim they refer to.
- `ReviewProgress` — reviewed count, percentage meter and a breakdown across all five review states, with an explicit note that review progress is tracked separately from evidence coverage because reviewing a claim does not create evidence for it.
- Header actions — "Decision memo" (print) and "Reset demo". Reset is disabled with an explanatory tooltip when there is nothing to discard.
- Persistence — reviewer mutations are mirrored to `localStorage` (`decisiontrace.review.v1`). Only mutations are stored, keyed by asset id and schema version; corrupt, foreign-asset or old-version payloads are ignored in favour of the pristine fixture.

**Verification**

| Command                               | Result                                  |
| ------------------------------------- | --------------------------------------- |
| `npm test`                            | pass — 83 tests across 5 files (19 new) |
| `npm run lint`                        | pass                                    |
| `npm run typecheck`                   | pass                                    |
| `npm run build`                       | pass                                    |
| Live browser workflow (16 assertions) | all pass                                |

The browser run exercised the whole loop: reset disabled at start → filter to contradictions → open a claim → escalate with a rationale → claim badge and per-claim review history update (1 → 2 entries) → audit trail grows by exactly one event → progress reads 1/14 → reset becomes enabled → a rejection with no rationale is blocked with the explanatory alert → the same rejection succeeds once a reason is given → state survives a full page reload → reset restores 0/14, the original 7 audit events and the disabled button → the reset also persists across another reload. No page errors.

New unit tests additionally assert that the source fixture is never mutated by a review, that coverage is unchanged by review actions, that clearing a review is itself auditable, and that stored state from a different asset or a corrupt payload falls back to the fixture.

**Known limitations**

- The reviewer identity is a fixed demo string ("You (diligence lead)"); a real deployment would take it from an authenticated session.
- Review state is per-browser, so two people reviewing the same demo do not see each other's actions. Out of scope for an overnight prototype, and called out in the README limitations.

**Next milestone:** M6 — the ranked decision-critical unknowns panel and the print-friendly decision memo.

---

## Milestone 6 — Decision-critical unknowns and memo view ✅

**Completed**

- `UnknownsPanel` — the five unknowns ranked by impact (all three high-impact ones first), each showing the question, an explicit "Why it could change the decision" rationale, the specialist to route it to, and links through to the claims it would change. Ranking is by potential effect on the recommendation, not by how much was written about it.
- `DecisionMemo` — a print-only, six-section memo: provisional recommendation, evidence position (coverage plus the weight table and review-state counts), ranked unknowns, all claims by domain with classification/confidence/review state/record count/reviewer, human review actions, and methodology + limitations.
- Print behaviour — the interactive workspace is wrapped in `print:hidden` and the memo in `hidden print:block`, so printing produces the memo alone rather than a screenshot of an app. Verified at A4 width: the memo lays out at 688 px with `scrollWidth === innerWidth`, i.e. no horizontal clipping, and nothing is cut off.

**Truthfulness safeguards in the memo**

Four separate statements keep the memo from reading as a clinical prediction, and each is asserted by a test: the recommendation is "not a prediction that the asset will succeed"; "no probability of technical or regulatory success is asserted anywhere in this memo"; coverage "is not a probability of technical, clinical or regulatory success"; and the memo "does not constitute medical, regulatory or investment advice". The exact coverage formula and all four weights are printed in the methodology section, so a reader can recompute the number rather than trust it.

**Bug found and fixed during verification**

The first print run logged React error #418 — a hydration mismatch, because the memo computed `new Date()` during render, producing different text on the server and in the browser. Fixed with `src/state/print-timestamp.ts`: an external store whose server snapshot is empty and which refreshes on the browser's `beforeprint` event, so the memo is stamped with when it was actually printed and hydration matches. Re-verified: no page errors.

**Verification**

| Command                                 | Result                                                           |
| --------------------------------------- | ---------------------------------------------------------------- |
| `npm test`                              | pass — 97 tests across 6 files (14 new)                          |
| `npm run lint`                          | pass                                                             |
| `npm run typecheck`                     | pass                                                             |
| `npm run build`                         | pass                                                             |
| Live print/screen check (18 assertions) | all pass, no page errors                                         |
| Rendered A4 memo                        | legible, six sections, no clipped content or horizontal overflow |

**Next milestone:** M7 — the optional public-data adapter (attempted only now that M0–M6 pass).

---

## Milestone 7 — Optional public-data adapter ✅ (partial, with a documented limitation)

**Environment finding, established first**

Both candidate public APIs are unreachable from this build environment. Its egress proxy allows package registries only and returns `403 CONNECT tunnel failed` for everything else:

```
clinicaltrials.gov:443           → connect_rejected (organization policy)
eutils.ncbi.nlm.nih.gov:443      → connect_rejected (organization policy)
```

So the milestone's caching step could not be completed honestly. **No response snapshot was cached, because none could be legitimately retrieved — and inventing one would be exactly the fabrication the brief forbids.** Everything that does not depend on live egress was built and verified.

**Completed**

- `src/sources/types.ts` — the `SourceAdapter` interface, a `SourceQuery` (term, limit, abort signal) and a discriminated `SourceResult`. The contract is deliberately narrow: an adapter returns records it actually retrieved and validated, or it fails. It may never invent a record, and may never set `isIllustrative: false` unless the record was fetched from the named public API, passed schema validation, and has a canonical URL.
- `src/sources/clinicaltrials.ts` — one adapter for ClinicalTrials.gov API v2 (public, key-free). Requests only the fields it needs, validates the response against a Zod schema of the documented v2 shape, then **re-validates each normalized record against the domain `evidenceItemSchema`**. A record that fails is dropped, never patched into shape. `fetch` is injected so the adapter is testable without egress. An 8-second `AbortSignal.timeout` means a slow public API cannot hang a request.
- **Registry records are typed as `context`, never as support.** A registration proves a study was registered and what it claims to measure — not that it produced a result — and the generated summary says so in as many words. Missing fields become an explicit "not stated" rather than a plausible guess.
- `src/app/api/sources/route.ts` — server-side only, so no third-party host or header reaches the browser. Validates its query with Zod, returns 400 for a bad request, 503 when the adapter is disabled and 502 for an upstream failure, each with a plain-language reason.
- Disabled by default: the adapter is off unless `DECISIONTRACE_ENABLE_LIVE_SOURCES=true`, so the demo never depends on an outbound request and a sandbox with no egress does not present a broken control. No API key or secret is involved anywhere.

**Verification**

| Check | Result |
| --- | --- |
| `npm test` | pass — 109 tests across 7 files (12 new) |
| `npm run lint` / `typecheck` / `build` | pass |
| `GET /api/sources?term=neuromuscular` (default) | `503` — `{"reason":"disabled", …}` with a plain explanation |
| `GET /api/sources?term=a` | `400` — `invalid_request`, "expected string to have >=2 characters" |
| `GET /api/sources?term=neuromuscular` **with live sources enabled against real blocked egress** | `502` — `{"reason":"http_error","detail":"ClinicalTrials.gov responded 403."}` |
| Workspace during that failure | `200`, illustrative banner intact — a dead adapter cannot break the app |
| Client HTML | contains no adapter internals, hostnames or env-var names |

Adapter unit tests use an injected `fetch` to cover both directions: a valid v2 payload normalizes into a schema-valid, non-illustrative, linked, `retrievedAt`-stamped record; and network failure, HTTP error, non-JSON body, wrong-shape payload and a malformed `NCTId` each produce a typed failure rather than a fabricated or half-valid record. A final test asserts the fixture remains the default path — every fixture record is `isIllustrative` with no `retrievedAt`.

**Known limitations**

- **No cached live snapshot.** Blocked egress; documented above rather than faked. On a machine with normal internet access, `DECISIONTRACE_ENABLE_LIVE_SOURCES=true npm run dev` then `GET /api/sources?term=<condition>` exercises the retrieval path end to end.
- The adapter is not wired into the workspace UI. That is deliberate: the fixture is the demonstration path, and mixing a live lookup into it would blur exactly the line this product exists to draw.
- The optional model-classification route from §8 of the brief was not built. It is explicitly not a milestone blocker, and with the deterministic app complete the remaining time was better spent on the M8 quality pass.

**Next milestone:** M8 — quality pass, Playwright smoke path, responsive checks, README and demo script.
