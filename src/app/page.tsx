import { ArrowRight, GitCompareArrows, Route, UserRoundSearch } from "lucide-react";
import { getDemoAsset } from "@/data";
import { summarizeAsset } from "@/domain/coverage";
import { ButtonLink, Card } from "@/components/ui";
import {
  AppFooter,
  AppHeader,
  MAIN_CONTENT_ID,
  PROTOTYPE_LABEL,
  SkipLink,
} from "@/components/layout/AppShell";

const BENEFITS = [
  {
    icon: Route,
    title: "Traceability",
    body: "Every claim carries its own evidence, its confidence rationale and its review history — so a memo can be checked line by line instead of accepted whole.",
  },
  {
    icon: GitCompareArrows,
    title: "Contradiction detection",
    body: "Sourced facts, model inferences, conflicting sources and outright gaps are four visibly different things. A gap is never quietly filled with an inference.",
  },
  {
    icon: UserRoundSearch,
    title: "Expert escalation",
    body: "Unknowns are ranked by how much they could move the decision, and each one names the specialist who can actually close it.",
  },
];

export default function LandingPage() {
  const asset = getDemoAsset();
  const summary = summarizeAsset(asset);

  return (
    <>
      <SkipLink />
      <AppHeader />
      <main id={MAIN_CONTENT_ID} className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
            Evidence integrity for drug-asset diligence
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-[1.15] tracking-tight text-ink sm:text-[40px]">
            Turn an AI-generated drug-asset recommendation into a decision record an expert can
            challenge.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
            DecisionTrace takes one asset that an upstream sourcing system has already surfaced and
            makes the reasoning behind its recommendation inspectable: what is directly sourced,
            what a model inferred, what contradicts itself, and what is simply missing.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ButtonLink href={`/assets/${asset.id}`} variant="primary" className="px-4 py-2">
              Open demonstration asset
              <ArrowRight aria-hidden className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/methodology" variant="ghost">
              How the classifications work
            </ButtonLink>
          </div>

          <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-ink-subtle">Claims</dt>
              <dd className="font-semibold tabular-nums text-ink">{summary.claimCount}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-ink-subtle">
                Evidence coverage
              </dt>
              <dd className="font-semibold tabular-nums text-ink">{summary.coveragePercent}%</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-ink-subtle">
                Contradictions
              </dt>
              <dd className="font-semibold tabular-nums text-ink">
                {summary.classification.contradiction}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-ink-subtle">
                Claims with no evidence
              </dt>
              <dd className="font-semibold tabular-nums text-ink">
                {summary.classification.missing_evidence}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-ink-subtle">
                High-impact unknowns
              </dt>
              <dd className="font-semibold tabular-nums text-ink">
                {summary.highImpactUnknownCount}
              </dd>
            </div>
          </dl>

          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, body }) => (
              <li key={title}>
                <Card className="h-full p-4">
                  <Icon aria-hidden className="h-4 w-4 text-accent" strokeWidth={2} />
                  <h2 className="mt-2.5 text-sm font-semibold tracking-tight text-ink">{title}</h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{body}</p>
                </Card>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-md border border-line bg-surface-muted px-4 py-3">
            <p className="text-xs leading-relaxed text-ink-muted">
              <strong className="font-semibold text-ink">{PROTOTYPE_LABEL}.</strong> The
              demonstration asset <span className="font-medium text-ink">{asset.name}</span> and all
              of its evidence are synthetic and clearly labelled as illustrative throughout. No real
              publication, trial registration, institution or identifier is referenced, and the demo
              runs entirely from a local fixture — no API keys, no network calls.
            </p>
          </div>
        </div>
      </main>
      <AppFooter />
    </>
  );
}
