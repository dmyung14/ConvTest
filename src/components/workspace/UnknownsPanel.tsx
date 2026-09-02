"use client";

import { ArrowUpRight, HelpCircle } from "lucide-react";
import type { Asset, Claim, CriticalUnknown } from "@/domain/schema";
import { rankUnknowns } from "@/domain/coverage";
import { IMPACT_META } from "@/domain/labels";
import { Badge, Card, CardHeader, cx } from "@/components/ui";

/**
 * Decision-critical unknowns, ranked by potential effect on the recommendation.
 *
 * This is the panel the brief cares most about: the point of the product is to
 * send a specialist to the question that could actually change the answer,
 * rather than to the longest section of the memo.
 */
export function UnknownsPanel({
  asset,
  onSelectClaim,
}: {
  asset: Asset;
  onSelectClaim?: (claim: Claim) => void;
}) {
  const ranked = rankUnknowns(asset.unknowns);
  const claimById = new Map(asset.claims.map((claim) => [claim.id, claim]));

  return (
    <Card className="dt-print-block overflow-hidden">
      <CardHeader
        title="Decision-critical unknowns"
        description="Ranked by how much resolving them could move the recommendation, not by how much has been written about them."
        action={
          <span className="text-xs tabular-nums text-ink-subtle">
            {ranked.filter((unknown) => unknown.impact === "high").length} high impact
          </span>
        }
      />
      <ol className="divide-y divide-line">
        {ranked.map((unknown, index) => (
          <UnknownRow
            key={unknown.id}
            unknown={unknown}
            rank={index + 1}
            claimById={claimById}
            onSelectClaim={onSelectClaim}
          />
        ))}
      </ol>
    </Card>
  );
}

function UnknownRow({
  unknown,
  rank,
  claimById,
  onSelectClaim,
}: {
  unknown: CriticalUnknown;
  rank: number;
  claimById: Map<string, Claim>;
  onSelectClaim?: (claim: Claim) => void;
}) {
  const impact = IMPACT_META[unknown.impact];
  const linked = unknown.linkedClaimIds
    .map((id) => claimById.get(id))
    .filter((claim): claim is Claim => Boolean(claim));

  return (
    <li className="dt-print-block px-4 py-4 sm:px-5">
      <div className="flex items-start gap-3">
        <span
          className={cx(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums",
            unknown.impact === "high"
              ? "border-danger/30 bg-danger-soft text-danger"
              : "border-line bg-surface-muted text-ink-muted",
          )}
        >
          {rank}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="min-w-0 text-sm font-semibold leading-snug text-ink">
              {unknown.question}
            </h3>
            <Badge className={impact.chipClass} title={impact.description}>
              {impact.label}
            </Badge>
          </div>

          <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
            <span className="font-medium text-ink">Why it could change the decision: </span>
            {unknown.rationale}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <p className="flex items-center gap-1.5 text-xs text-ink-muted">
              <HelpCircle aria-hidden className="h-3.5 w-3.5 text-ink-subtle" />
              <span className="font-medium text-ink">Route to:</span>
              {unknown.requiredReviewer}
            </p>

            {linked.length > 0 ? (
              <p className="dt-no-print flex flex-wrap items-center gap-1.5 text-xs text-ink-subtle">
                <span>Affects:</span>
                {linked.map((claim) =>
                  onSelectClaim ? (
                    <button
                      key={claim.id}
                      type="button"
                      onClick={() => onSelectClaim(claim)}
                      className="inline-flex max-w-[22rem] items-center gap-1 truncate rounded-sm text-accent hover:underline"
                      title={claim.text}
                    >
                      <span className="truncate">{claim.text}</span>
                      <ArrowUpRight aria-hidden className="h-3 w-3 shrink-0" />
                    </button>
                  ) : (
                    <span key={claim.id} className="max-w-[22rem] truncate" title={claim.text}>
                      {claim.text}
                    </span>
                  ),
                )}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}
