import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { COVERAGE_WEIGHTS } from "@/domain/coverage";
import {
  CLASSIFICATION_META,
  CLASSIFICATION_ORDER,
  REVIEW_STATUS_META,
  REVIEW_STATUS_ORDER,
} from "@/domain/labels";
import { DEMO_ASSET_ID } from "@/data";
import { ButtonLink, Card } from "@/components/ui";
import { AppFooter, AppHeader, MAIN_CONTENT_ID, SkipLink } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How DecisionTrace separates sourced facts from model inference, computes evidence coverage, handles contradictions and records human review.",
};

export default function MethodologyPage() {
  return (
    <>
      <SkipLink />
      <AppHeader />
      <main id={MAIN_CONTENT_ID} className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Methodology
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
            DecisionTrace makes one narrow claim: that the reasoning behind an AI-generated
            drug-asset recommendation can be inspected, challenged and recorded. Everything below
            describes how that is done, and — just as importantly — what the numbers on screen do
            not mean.
          </p>

          <section className="mt-8">
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              Facts versus inference
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              A polished memo can conceal weak evidence, because a sourced fact and a plausible
              inference read identically in prose. Every claim is therefore labelled with exactly
              one of four states, and they are rendered differently everywhere they appear.
            </p>
            <dl className="mt-4 space-y-3">
              {CLASSIFICATION_ORDER.map((key) => (
                <Card key={key} className="p-4">
                  <dt className="text-sm font-semibold text-ink">
                    {CLASSIFICATION_META[key].label}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {CLASSIFICATION_META[key].description}
                  </dd>
                </Card>
              ))}
            </dl>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              The rule that matters most: a gap is recorded as a gap. Missing evidence is never
              quietly replaced by an inference that sounds like an answer.
            </p>
          </section>

          <section className="mt-9">
            <h2 className="text-lg font-semibold tracking-tight text-ink">Evidence coverage</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Coverage answers one question: how much of this asset&rsquo;s claim set is backed by
              evidence a reviewer can actually open? Each claim contributes a fixed weight
              determined only by its classification.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wider text-ink-subtle">
                    <th className="py-2 pr-4 font-medium">Classification</th>
                    <th className="py-2 font-medium">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {CLASSIFICATION_ORDER.map((key) => (
                    <tr key={key} className="border-b border-line">
                      <td className="py-2 pr-4 text-ink-muted">{CLASSIFICATION_META[key].label}</td>
                      <td className="py-2 tabular-nums text-ink">
                        {COVERAGE_WEIGHTS[key].toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 rounded-md border border-line bg-surface-muted px-3 py-2.5 font-mono text-xs text-ink">
              coveragePercent = round(100 × Σ weight(claim) / claimCount)
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              <strong className="font-semibold text-ink">What coverage is not.</strong> It is not a
              probability of technical, clinical or regulatory success. It does not encode
              scientific quality, and a high number is not a recommendation. An asset can reach high
              coverage on well-sourced but unimportant claims — which is why coverage is always
              shown next to the decision-critical unknowns rather than on its own.
            </p>
          </section>

          <section className="mt-9">
            <h2 className="text-lg font-semibold tracking-tight text-ink">Confidence rationale</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Confidence describes the strength of the evidence for a claim, not the likelihood the
              drug works. Every claim carries a written rationale, not just a level, because
              &ldquo;medium confidence&rdquo; on its own tells a reviewer nothing about what to
              check next.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Classification and confidence are independent axes. A directly sourced claim can carry
              low confidence when its only source is weak or self-interested — the demonstration
              asset includes exactly that case, where the reason a programme was paused is sourced
              but self-reported by the party with an incentive.
            </p>
          </section>

          <section className="mt-9">
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              Contradiction handling
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              When sources disagree, the claim is marked as a contradiction and stays unsettled. The
              conflicting record is shown <em>above</em> the supporting one in the evidence drawer,
              so a reviewer meets the disagreement before the reassurance. Contradictions are
              weighted at 0.25 rather than 0: evidence exists, it just does not resolve the claim.
            </p>
          </section>

          <section className="mt-9">
            <h2 className="text-lg font-semibold tracking-tight text-ink">Human-review states</h2>
            <dl className="mt-3 space-y-2">
              {REVIEW_STATUS_ORDER.map((key) => (
                <div key={key} className="border-l-2 border-line pl-3">
                  <dt className="text-sm font-semibold text-ink">
                    {REVIEW_STATUS_META[key].label}
                  </dt>
                  <dd className="text-sm leading-relaxed text-ink-muted">
                    {REVIEW_STATUS_META[key].description}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Rejecting or superseding a claim overrides the evidence on record, so those actions
              require a written reason. Verifying or escalating follows from the evidence, so a
              reason is invited but not enforced — an audit trail full of compulsory boilerplate is
              no better than an empty one. Review progress is reported separately from coverage,
              because reviewing a claim does not create evidence for it.
            </p>
          </section>

          <section className="mt-9">
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              Demonstration limitations
            </h2>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink-muted">
              <li>
                The default asset and every source in it are synthetic. There are no real
                publications, trials, institutions or identifiers, and illustrative records are
                deliberately unlinked so they cannot be mistaken for citations.
              </li>
              <li>
                A source is shown as verified only when an adapter actually retrieved it from a
                named public API and it passed validation. Nothing else is ever labelled verified.
              </li>
              <li>
                Review state is held per browser. There is no database, no authentication and no
                shared workspace — deliberately, for a prototype.
              </li>
              <li>
                DecisionTrace does not predict whether a drug will work, does not replace
                scientific, clinical, regulatory or investment judgement, and does not provide
                medical, regulatory or investment advice.
              </li>
              <li>
                This is an independent prototype. It is not a Convexia product and is not built from
                any non-public information about Convexia&rsquo;s systems.
              </li>
            </ul>
          </section>

          <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-6">
            <ButtonLink href={`/assets/${DEMO_ASSET_ID}`} variant="primary">
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Back to the demonstration asset
            </ButtonLink>
          </div>
        </div>
      </main>
      <AppFooter />
    </>
  );
}
