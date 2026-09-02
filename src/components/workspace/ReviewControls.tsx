"use client";

import { useId, useState } from "react";
import { CheckCircle2, RotateCcw, ShieldAlert, XCircle } from "lucide-react";
import type { Claim, ReviewStatus } from "@/domain/schema";
import { REVIEW_STATUS_META } from "@/domain/labels";
import { isRationaleRequired } from "@/state/workspace-store";
import { Button, cx } from "@/components/ui";

const ACTIONS: Array<{
  status: Exclude<ReviewStatus, "unreviewed">;
  icon: typeof CheckCircle2;
  className: string;
}> = [
  {
    status: "verified",
    icon: CheckCircle2,
    className: "border-accent/40 text-accent-ink hover:bg-accent-soft",
  },
  {
    status: "needs_specialist",
    icon: ShieldAlert,
    className: "border-amber/40 text-amber hover:bg-amber-soft",
  },
  {
    status: "rejected",
    icon: XCircle,
    className: "border-danger/40 text-danger hover:bg-danger-soft",
  },
  {
    status: "superseded",
    icon: RotateCcw,
    className: "border-slate/40 text-slate hover:bg-slate-soft",
  },
];

/**
 * Expert-review controls for one claim.
 *
 * The parent keys this component by claim id, so switching claims remounts it
 * rather than carrying a half-typed rationale across to a different claim.
 *
 * Rejecting or superseding a claim overrides the evidence, so a rationale is
 * required for those. Verifying or escalating is self-explanatory from the
 * evidence, so a rationale is invited but not enforced — an audit trail full of
 * boilerplate is no better than an empty one.
 */
export function ReviewControls({
  claim,
  onReview,
}: {
  claim: Claim;
  onReview: (claimId: string, status: ReviewStatus, rationale: string) => void;
}) {
  const [pending, setPending] = useState<ReviewStatus | null>(null);
  const [rationale, setRationale] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fieldId = useId();
  const errorId = `${fieldId}-error`;

  const required = pending ? isRationaleRequired(pending) : false;

  const submit = () => {
    if (!pending) return;
    if (required && rationale.trim().length < 8) {
      setError(
        `${REVIEW_STATUS_META[pending].label} overrides the evidence on record. Give a short reason (at least 8 characters) so the audit trail is worth reading.`,
      );
      return;
    }
    onReview(claim.id, pending, rationale);
    setPending(null);
    setRationale("");
    setError(null);
  };

  return (
    <div className="px-4 py-3 sm:px-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
        Expert review
      </p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {ACTIONS.map(({ status, icon: Icon, className }) => {
          const active = pending === status;
          const current = claim.reviewStatus === status;
          return (
            <button
              key={status}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setPending((currentPending) => (currentPending === status ? null : status));
                setError(null);
              }}
              className={cx(
                "inline-flex items-center gap-1.5 rounded-md border bg-surface px-2.5 py-1.5 text-xs font-medium transition-colors",
                className,
                active && "ring-2 ring-inset ring-current",
                current && !active && "bg-surface-muted",
              )}
            >
              <Icon aria-hidden className="h-3.5 w-3.5" />
              {REVIEW_STATUS_META[status].label}
              {current ? <span className="text-[10px] opacity-70">(current)</span> : null}
            </button>
          );
        })}

        {claim.reviewStatus !== "unreviewed" ? (
          <Button
            variant="ghost"
            className="px-2 py-1 text-xs"
            onClick={() => onReview(claim.id, "unreviewed", "Cleared this claim's review state.")}
          >
            Clear review state
          </Button>
        ) : null}
      </div>

      {pending ? (
        <div className="mt-3">
          <label htmlFor={fieldId} className="text-xs font-medium text-ink">
            Rationale{" "}
            <span className="font-normal text-ink-subtle">
              {required ? "(required — this overrides the evidence)" : "(recommended)"}
            </span>
          </label>
          <textarea
            id={fieldId}
            value={rationale}
            onChange={(event) => {
              setRationale(event.target.value);
              if (error) setError(null);
            }}
            rows={3}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            placeholder={
              required
                ? "What in the evidence does not support this claim?"
                : "What did you check, and what would change your mind?"
            }
            className="mt-1.5 w-full rounded-md border border-line bg-surface px-2.5 py-2 text-xs leading-relaxed text-ink placeholder:text-ink-subtle"
          />
          {error ? (
            <p id={errorId} role="alert" className="mt-1.5 text-xs text-danger">
              {error}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button variant="primary" onClick={submit}>
              Record {REVIEW_STATUS_META[pending].label.toLowerCase()}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setPending(null);
                setRationale("");
                setError(null);
              }}
            >
              Cancel
            </Button>
            <p className="text-[11px] text-ink-subtle">
              Recorded against your reviewer identity, with a timestamp, in the audit trail.
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-[11px] leading-relaxed text-ink-subtle">
          A review action records who acted, what they decided, why, and when. It does not change a
          scientifically validated probability of success — it changes what this bundle can be
          trusted to say.
        </p>
      )}
    </div>
  );
}
