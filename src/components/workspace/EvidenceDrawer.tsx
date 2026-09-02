"use client";

import {
  AlertOctagon,
  ExternalLink,
  FileSearch,
  FlaskConical,
  Info,
  Scale,
  ShieldQuestion,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Asset, Claim, EvidenceItem } from "@/domain/schema";
import {
  CLASSIFICATION_META,
  CONFIDENCE_META,
  DOMAIN_META,
  RELATIONSHIP_META,
  REVIEW_STATUS_META,
  formatDate,
  formatTimestamp,
} from "@/domain/labels";
import { Badge, Drawer, cx } from "@/components/ui";

/** Section wrapper: one consistent heading treatment throughout the drawer. */
function Section({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("mt-5 first:mt-0", className)}>
      <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
        {icon}
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/**
 * The classification banner. This is the drawer's most important element: it
 * states, before any source is read, whether what follows is a sourced fact, a
 * model's reasoning, an unresolved conflict, or nothing at all.
 */
function ClassificationCallout({ claim }: { claim: Claim }) {
  const meta = CLASSIFICATION_META[claim.classification];
  const Icon =
    claim.classification === "direct_support"
      ? FileSearch
      : claim.classification === "model_inference"
        ? Sparkles
        : claim.classification === "contradiction"
          ? AlertOctagon
          : ShieldQuestion;

  return (
    <div className={cx("rounded-md border px-3 py-2.5", meta.chipClass)}>
      <p className="flex items-center gap-1.5 text-xs font-semibold">
        <Icon aria-hidden className="h-3.5 w-3.5" />
        {meta.label}
      </p>
      <p className="mt-1 text-xs leading-relaxed opacity-90">{meta.description}</p>
    </div>
  );
}

function EvidenceCard({ item }: { item: EvidenceItem }) {
  const relationship = RELATIONSHIP_META[item.relationship];
  const verified = !item.isIllustrative && Boolean(item.url);

  return (
    <li
      className={cx(
        "rounded-md border bg-surface p-3",
        item.relationship === "weakens" ? "border-danger/30" : "border-line",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="min-w-0 text-sm font-medium leading-snug text-ink">{item.title}</p>
        <Badge className={relationship.chipClass} title={relationship.description}>
          {relationship.label}
        </Badge>
      </div>

      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-subtle">
        <span>{item.publisher}</span>
        <span aria-hidden>·</span>
        <span>{item.sourceType}</span>
        <span aria-hidden>·</span>
        <span className="tabular-nums">{formatDate(item.publishedAt)}</span>
      </p>

      <p className="mt-2 text-xs leading-relaxed text-ink-muted">{item.summary}</p>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {item.isIllustrative ? (
          <Badge
            className="border-amber/30 bg-amber-soft text-amber"
            title="Synthetic record in the demonstration corpus. Not a real publication, and deliberately not linked."
          >
            <FlaskConical aria-hidden className="h-3 w-3" />
            Illustrative record — not a real citation
          </Badge>
        ) : (
          <Badge
            className="border-accent/30 bg-accent-soft text-accent-ink"
            title={
              item.retrievedAt
                ? `Retrieved and validated ${formatTimestamp(item.retrievedAt)} UTC`
                : "Retrieved and validated from a public source"
            }
          >
            Verified source
          </Badge>
        )}

        {/* A link is offered only for a record that was actually retrieved. */}
        {verified ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            Open source
            <ExternalLink aria-hidden className="h-3 w-3" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : null}
      </div>
    </li>
  );
}

export function EvidenceDrawer({
  asset,
  claim,
  onClose,
  footer,
}: {
  asset: Asset;
  claim: Claim | null;
  onClose: () => void;
  footer?: ReactNode;
}) {
  if (!claim) return null;

  const supporting = claim.evidence.filter((item) => item.relationship === "supports");
  const weakening = claim.evidence.filter((item) => item.relationship === "weakens");
  const contextual = claim.evidence.filter((item) => item.relationship === "context");
  const reviewMeta = REVIEW_STATUS_META[claim.reviewStatus];
  const confidenceMeta = CONFIDENCE_META[claim.confidence];

  const history = asset.auditEvents
    .filter((event) => event.claimId === claim.id)
    .slice()
    .reverse();

  const relatedUnknowns = asset.unknowns.filter((unknown) =>
    unknown.linkedClaimIds.includes(claim.id),
  );

  return (
    <Drawer
      open
      onClose={onClose}
      title={claim.text}
      subtitle={
        <span className="flex flex-wrap items-center gap-1.5">
          <span>{DOMAIN_META[claim.domain].label}</span>
          <span aria-hidden>·</span>
          <span>Assigned to: {claim.reviewerType}</span>
        </span>
      }
      footer={footer}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge className={CLASSIFICATION_META[claim.classification].chipClass}>
          {CLASSIFICATION_META[claim.classification].label}
        </Badge>
        <Badge className={confidenceMeta.chipClass}>{confidenceMeta.label}</Badge>
        <Badge className={reviewMeta.chipClass}>{reviewMeta.label}</Badge>
        {claim.lastReviewedAt ? (
          <span className="text-[11px] tabular-nums text-ink-subtle">
            Last reviewed {formatTimestamp(claim.lastReviewedAt)} UTC
          </span>
        ) : null}
      </div>

      <div className="mt-3">
        <ClassificationCallout claim={claim} />
      </div>

      <Section
        title="Why this matters to the decision"
        icon={<Scale aria-hidden className="h-3 w-3" />}
      >
        <p className="text-sm leading-relaxed text-ink-muted">{claim.decisionRelevance}</p>
      </Section>

      <Section title="Confidence rationale" icon={<Info aria-hidden className="h-3 w-3" />}>
        <div className="rounded-md border border-line bg-surface-muted px-3 py-2.5">
          <p className="text-xs font-semibold text-ink">{confidenceMeta.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">{claim.confidenceRationale}</p>
        </div>
      </Section>

      {claim.evidence.length === 0 ? (
        <Section title="Evidence">
          <div className="rounded-md border border-dashed border-amber/50 bg-amber-soft/50 px-3 py-4 text-center">
            <ShieldQuestion aria-hidden className="mx-auto h-5 w-5 text-amber" />
            <p className="mt-2 text-sm font-semibold text-amber">No evidence records</p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
              Nothing in this bundle addresses the claim. The gap is recorded as a gap — no
              inference has been substituted for it, and the claim contributes zero to evidence
              coverage. Closing it requires new evidence, not further reasoning over the same
              corpus.
            </p>
          </div>
        </Section>
      ) : (
        <>
          {weakening.length > 0 ? (
            <Section
              title={`Conflicting evidence (${weakening.length})`}
              icon={<AlertOctagon aria-hidden className="h-3 w-3 text-danger" />}
            >
              <ul className="space-y-2">
                {weakening.map((item) => (
                  <EvidenceCard key={item.id} item={item} />
                ))}
              </ul>
            </Section>
          ) : null}

          {supporting.length > 0 ? (
            <Section title={`Supporting evidence (${supporting.length})`}>
              <ul className="space-y-2">
                {supporting.map((item) => (
                  <EvidenceCard key={item.id} item={item} />
                ))}
              </ul>
            </Section>
          ) : null}

          {contextual.length > 0 ? (
            <Section title={`Context (${contextual.length})`}>
              <ul className="space-y-2">
                {contextual.map((item) => (
                  <EvidenceCard key={item.id} item={item} />
                ))}
              </ul>
            </Section>
          ) : null}

          {claim.classification === "model_inference" && supporting.length === 0 ? (
            <p className="mt-2 text-xs leading-relaxed text-ink-subtle">
              Note: the records above are context for the inference, not support for the claim
              itself. No source states this claim directly.
            </p>
          ) : null}
        </>
      )}

      {relatedUnknowns.length > 0 ? (
        <Section title={`Linked decision-critical unknowns (${relatedUnknowns.length})`}>
          <ul className="space-y-2">
            {relatedUnknowns.map((unknown) => (
              <li key={unknown.id} className="rounded-md border border-line bg-surface p-3">
                <p className="text-xs font-medium leading-relaxed text-ink">{unknown.question}</p>
                <p className="mt-1 text-[11px] text-ink-subtle">
                  Requires: {unknown.requiredReviewer}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title={`Review history (${history.length})`}>
        {history.length === 0 ? (
          <p className="rounded-md border border-line bg-surface-muted px-3 py-2.5 text-xs leading-relaxed text-ink-subtle">
            No human has acted on this claim yet. Agent ingestion and classification events for the
            whole asset are in the audit trail below the claim matrix.
          </p>
        ) : (
          <ol className="space-y-2">
            {history.map((event) => (
              <li key={event.id} className="rounded-md border border-line bg-surface p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs font-semibold text-ink">{event.action}</p>
                  <p className="text-[11px] tabular-nums text-ink-subtle">
                    {formatTimestamp(event.timestamp)} UTC
                  </p>
                </div>
                <p className="mt-0.5 text-[11px] text-ink-subtle">{event.actor}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{event.rationale}</p>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </Drawer>
  );
}
