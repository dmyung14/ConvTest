import { Bot, Cpu, UserRound } from "lucide-react";
import type { Asset, AuditEvent } from "@/domain/schema";
import { formatTimestamp } from "@/domain/labels";
import { Badge, Card, CardHeader, cx } from "@/components/ui";

const ACTOR_META: Record<
  AuditEvent["actorType"],
  { label: string; icon: typeof Bot; className: string }
> = {
  agent: { label: "Agent", icon: Bot, className: "bg-slate-soft text-slate border-slate/30" },
  system: {
    label: "System",
    icon: Cpu,
    className: "bg-surface-muted text-ink-muted border-line-strong",
  },
  human: {
    label: "Human",
    icon: UserRound,
    className: "bg-accent-soft text-accent-ink border-accent/30",
  },
};

/**
 * Append-only record of how this decision reached its current state. Agent and
 * system events come from the fixture; human events are appended live as the
 * reviewer acts. Newest first, because the question being asked is almost always
 * "what just changed?".
 */
export function AuditTrail({ asset, claimLookup }: { asset: Asset; claimLookup?: boolean }) {
  const events = [...asset.auditEvents].reverse();
  const claimText = new Map(asset.claims.map((claim) => [claim.id, claim.text]));

  return (
    <Card className="dt-print-block overflow-hidden">
      <CardHeader
        title="Audit trail"
        description="Every ingestion, classification and human review action, newest first."
        action={
          <span className="text-xs tabular-nums text-ink-subtle">{events.length} events</span>
        }
      />
      <ol className="divide-y divide-line">
        {events.map((event) => {
          const meta = ACTOR_META[event.actorType];
          const Icon = meta.icon;
          return (
            <li key={event.id} className="px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Badge className={cx(meta.className)}>
                    <Icon aria-hidden className="h-3 w-3" />
                    {meta.label}
                  </Badge>
                  <p className="text-sm font-medium text-ink">{event.action}</p>
                </div>
                <p className="text-[11px] tabular-nums text-ink-subtle">
                  {formatTimestamp(event.timestamp)} UTC
                </p>
              </div>
              <p className="mt-1 text-[11px] text-ink-subtle">{event.actor}</p>
              {claimLookup && event.claimId && claimText.has(event.claimId) ? (
                <p className="mt-1.5 text-xs italic leading-snug text-ink-subtle">
                  Claim: {claimText.get(event.claimId)}
                </p>
              ) : null}
              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{event.rationale}</p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
