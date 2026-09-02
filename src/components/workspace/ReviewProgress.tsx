import type { AssetSummary } from "@/domain/coverage";
import { REVIEW_STATUS_META, REVIEW_STATUS_ORDER } from "@/domain/labels";
import { Meter } from "@/components/ui";

/**
 * Review progress, reported separately from evidence coverage on purpose:
 * reviewing a claim does not create evidence, so the two numbers must never be
 * blended into one reassuring score.
 */
export function ReviewProgress({ summary }: { summary: AssetSummary }) {
  const reviewed = summary.claimCount - summary.reviewStatus.unreviewed;
  return (
    <div className="dt-print-block rounded-lg border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-ink">Expert review progress</h2>
        <p className="text-sm font-semibold tabular-nums text-ink">
          {reviewed}/{summary.claimCount}
        </p>
      </div>
      <div className="mt-2">
        <Meter
          value={summary.reviewedPercent}
          label={`Claims reviewed: ${summary.reviewedPercent} percent`}
          tone="slate"
        />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-5">
        {REVIEW_STATUS_ORDER.map((status) => (
          <div key={status} className="flex items-baseline justify-between gap-2">
            <dt className="truncate text-[11px] text-ink-subtle">
              {REVIEW_STATUS_META[status].short}
            </dt>
            <dd className="text-sm font-semibold tabular-nums text-ink">
              {summary.reviewStatus[status]}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[11px] leading-relaxed text-ink-subtle">
        Review progress is tracked separately from evidence coverage. Reviewing a claim does not
        create evidence for it.
      </p>
    </div>
  );
}
