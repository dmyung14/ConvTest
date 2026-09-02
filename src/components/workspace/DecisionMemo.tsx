"use client";

import type { Asset } from "@/domain/schema";
import { usePrintTimestamp } from "@/state/print-timestamp";
import type { AssetSummary } from "@/domain/coverage";
import { COVERAGE_WEIGHTS, rankUnknowns } from "@/domain/coverage";
import {
  CLASSIFICATION_META,
  CLASSIFICATION_ORDER,
  DOMAIN_META,
  DOMAIN_ORDER,
  REVIEW_STATUS_META,
  REVIEW_STATUS_ORDER,
  formatTimestamp,
} from "@/domain/labels";
import { ILLUSTRATIVE_DISCLAIMER, PROTOTYPE_DISCLAIMER } from "@/components/layout/AppShell";

/**
 * Print-only decision memo.
 *
 * Hidden on screen and revealed by the browser's print stylesheet, so the demo
 * has an exportable record without a PDF pipeline. It states what the evidence
 * supports and what it does not, and it never presents a clinical prediction as
 * validated truth.
 */
export function DecisionMemo({ asset, summary }: { asset: Asset; summary: AssetSummary }) {
  const ranked = rankUnknowns(asset.unknowns);
  const generatedAt = usePrintTimestamp();
  const humanEvents = asset.auditEvents.filter((event) => event.actorType === "human");

  return (
    <div className="hidden print:block" data-testid="decision-memo">
      <header className="dt-print-block border-b border-line pb-3">
        <h1 className="text-xl font-semibold">Decision memo — {asset.name}</h1>
        <p className="mt-1 text-xs">
          {asset.indication} · {asset.modality} · {asset.developmentStage}
        </p>
        <p className="mt-1 text-xs">
          Owner / status: {asset.ownerStatus}. Evidence last refreshed{" "}
          {formatTimestamp(asset.updatedAt)} UTC.
          {generatedAt ? ` Memo generated ${formatTimestamp(generatedAt)} UTC.` : ""}
        </p>
        <p className="mt-2 text-xs font-semibold">{PROTOTYPE_DISCLAIMER}</p>
        <p className="text-xs">{ILLUSTRATIVE_DISCLAIMER}</p>
      </header>

      <section className="dt-print-block mt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider">
          1. Provisional recommendation
        </h2>
        <p className="mt-1 text-sm font-semibold">{asset.recommendation.label}</p>
        <p className="mt-1 text-xs leading-relaxed">{asset.recommendation.rationale}</p>
        <p className="mt-2 text-xs font-semibold">{asset.recommendation.confidenceLabel}</p>
        <p className="text-xs leading-relaxed">{asset.recommendation.confidenceExplanation}</p>
        <p className="mt-2 text-xs italic">
          This is a provisional, agent-generated recommendation about how to proceed with diligence.
          It is not a prediction that the asset will succeed, and no probability of technical or
          regulatory success is asserted anywhere in this memo.
        </p>
      </section>

      <section className="dt-print-block mt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider">2. Evidence position</h2>
        <p className="mt-1 text-xs">
          Evidence coverage: <strong>{summary.coveragePercent}%</strong> across {summary.claimCount}{" "}
          claims and {summary.evidenceCount} records. Claims reviewed by a human:{" "}
          <strong>
            {summary.claimCount - summary.reviewStatus.unreviewed}/{summary.claimCount}
          </strong>
          .
        </p>
        <table className="mt-2 w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="py-1 pr-3 font-medium">Evidence classification</th>
              <th className="py-1 pr-3 font-medium">Claims</th>
              <th className="py-1 font-medium">Coverage weight</th>
            </tr>
          </thead>
          <tbody>
            {CLASSIFICATION_ORDER.map((key) => (
              <tr key={key} className="border-b border-line">
                <td className="py-1 pr-3">{CLASSIFICATION_META[key].label}</td>
                <td className="py-1 pr-3 tabular-nums">{summary.classification[key]}</td>
                <td className="py-1 tabular-nums">{COVERAGE_WEIGHTS[key].toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1.5 text-xs">
          Review states:{" "}
          {REVIEW_STATUS_ORDER.map(
            (key) => `${REVIEW_STATUS_META[key].label} ${summary.reviewStatus[key]}`,
          ).join(" · ")}
        </p>
      </section>

      <section className="dt-print-block mt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider">
          3. Decision-critical unknowns
        </h2>
        <ol className="mt-1 space-y-2">
          {ranked.map((unknown, index) => (
            <li key={unknown.id} className="dt-print-block text-xs">
              <p className="font-semibold">
                {index + 1}. [{unknown.impact.toUpperCase()} IMPACT] {unknown.question}
              </p>
              <p className="mt-0.5 leading-relaxed">{unknown.rationale}</p>
              <p className="mt-0.5 italic">Route to: {unknown.requiredReviewer}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="dt-print-block mt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider">4. Claims by domain</h2>
        {DOMAIN_ORDER.map((domain) => {
          const claims = asset.claims.filter((claim) => claim.domain === domain);
          if (claims.length === 0) return null;
          return (
            <div key={domain} className="dt-print-block mt-2">
              <h3 className="text-xs font-semibold">{DOMAIN_META[domain].label}</h3>
              <ul className="mt-1 space-y-1">
                {claims.map((claim) => (
                  <li key={claim.id} className="text-xs leading-relaxed">
                    <span className="font-medium">{claim.text}</span>{" "}
                    <span>
                      [{CLASSIFICATION_META[claim.classification].label} · {claim.confidence}{" "}
                      confidence · {REVIEW_STATUS_META[claim.reviewStatus].label} ·{" "}
                      {claim.evidence.length} record{claim.evidence.length === 1 ? "" : "s"} ·
                      reviewer: {claim.reviewerType}]
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="dt-print-block mt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider">
          5. Human review actions ({humanEvents.length})
        </h2>
        {humanEvents.length === 0 ? (
          <p className="mt-1 text-xs">
            No human review actions have been recorded against this asset.
          </p>
        ) : (
          <ol className="mt-1 space-y-1.5">
            {humanEvents.map((event) => (
              <li key={event.id} className="text-xs leading-relaxed">
                <span className="font-medium">{formatTimestamp(event.timestamp)} UTC</span> —{" "}
                {event.actor}: {event.action}. {event.rationale}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="dt-print-block mt-4 border-t border-line pt-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider">
          6. Methodology and limitations
        </h2>
        <ul className="mt-1 space-y-1 text-xs leading-relaxed">
          <li>
            <strong>Classification.</strong> Each claim is labelled as a sourced fact (a record
            states it directly), a model inference (reasoning over adjacent evidence, with no source
            stating it), a contradiction (sources disagree) or missing evidence (nothing in the
            bundle addresses it). A gap is recorded as a gap and never filled with an inference.
          </li>
          <li>
            <strong>Coverage.</strong> coveragePercent = round(100 × Σ weight(claim) / claimCount),
            using the weights in section 2. It measures how much of the claim set is backed by
            inspectable evidence. It is not a probability of technical, clinical or regulatory
            success, and it does not encode scientific quality.
          </li>
          <li>
            <strong>Confidence.</strong> Confidence describes the strength of the evidence for a
            claim, not the likelihood the drug works. Classification and confidence are independent:
            a directly sourced claim can carry low confidence when its single source is weak or
            self-interested.
          </li>
          <li>
            <strong>Review states.</strong>{" "}
            {REVIEW_STATUS_ORDER.map(
              (key) => `${REVIEW_STATUS_META[key].label} — ${REVIEW_STATUS_META[key].description}`,
            ).join(" ")}
          </li>
          <li>
            <strong>Limitations.</strong> This memo summarises one evidence bundle at one point in
            time. It does not predict whether the asset will work, does not replace scientific,
            clinical, regulatory or investment judgement, and does not constitute medical,
            regulatory or investment advice. The default asset and every source in it are
            illustrative and synthetic unless explicitly marked as a retrieved, verified source.
          </li>
        </ul>
      </section>
    </div>
  );
}
