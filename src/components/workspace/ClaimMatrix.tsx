"use client";

import { ChevronRight, FileQuestion, Filter, X } from "lucide-react";
import type { Claim, DiligenceDomain, EvidenceClassification, ReviewStatus } from "@/domain/schema";
import type { AssetSummary } from "@/domain/coverage";
import {
  CLASSIFICATION_META,
  CLASSIFICATION_ORDER,
  CONFIDENCE_META,
  DOMAIN_META,
  DOMAIN_ORDER,
  REVIEW_STATUS_META,
  REVIEW_STATUS_ORDER,
  formatTimestamp,
} from "@/domain/labels";
import { Badge, Button, EmptyState, cx } from "@/components/ui";

export interface ClaimFilters {
  domain: DiligenceDomain | "all";
  classification: EvidenceClassification | "all";
  reviewStatus: ReviewStatus | "all";
}

export const EMPTY_FILTERS: ClaimFilters = {
  domain: "all",
  classification: "all",
  reviewStatus: "all",
};

export function applyClaimFilters(claims: readonly Claim[], filters: ClaimFilters): Claim[] {
  return claims.filter(
    (claim) =>
      (filters.domain === "all" || claim.domain === filters.domain) &&
      (filters.classification === "all" || claim.classification === filters.classification) &&
      (filters.reviewStatus === "all" || claim.reviewStatus === filters.reviewStatus),
  );
}

export function activeFilterCount(filters: ClaimFilters): number {
  return Object.values(filters).filter((value) => value !== "all").length;
}

/* ------------------------------------------------------- domain navigation */

export function DomainNav({
  summary,
  value,
  onChange,
}: {
  summary: AssetSummary;
  value: ClaimFilters["domain"];
  onChange: (domain: ClaimFilters["domain"]) => void;
}) {
  const total = summary.claimCount;
  return (
    <nav aria-label="Diligence domains" className="dt-no-print">
      <ul className="flex flex-wrap gap-1.5">
        <li>
          <DomainTab
            label="All domains"
            count={total}
            selected={value === "all"}
            onClick={() => onChange("all")}
          />
        </li>
        {DOMAIN_ORDER.map((domain) => (
          <li key={domain}>
            <DomainTab
              label={DOMAIN_META[domain].label}
              hint={DOMAIN_META[domain].description}
              count={summary.domain[domain]}
              selected={value === domain}
              onClick={() => onChange(domain)}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function DomainTab({
  label,
  hint,
  count,
  selected,
  onClick,
}: {
  label: string;
  hint?: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      aria-pressed={selected}
      className={cx(
        "inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
        selected
          ? "border-accent bg-accent text-white"
          : "border-line bg-surface text-ink-muted hover:border-line-strong hover:bg-surface-muted",
      )}
    >
      {label}
      <span
        className={cx(
          "rounded-full px-1.5 py-px text-[10px] tabular-nums",
          selected ? "bg-white/20 text-white" : "bg-surface-muted text-ink-subtle",
        )}
      >
        {count}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------- filter bar */

export function ClaimFilterBar({
  filters,
  summary,
  resultCount,
  onChange,
  onReset,
}: {
  filters: ClaimFilters;
  summary: AssetSummary;
  resultCount: number;
  onChange: (next: ClaimFilters) => void;
  onReset: () => void;
}) {
  const active = activeFilterCount(filters);
  return (
    <div className="dt-no-print flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5 sm:px-5">
      <Filter aria-hidden className="h-3.5 w-3.5 text-ink-subtle" />

      <label className="flex items-center gap-1.5 text-xs text-ink-muted">
        <span className="sr-only sm:not-sr-only">Evidence type</span>
        <select
          value={filters.classification}
          onChange={(event) =>
            onChange({
              ...filters,
              classification: event.target.value as ClaimFilters["classification"],
            })
          }
          aria-label="Filter by evidence classification"
          className="rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink"
        >
          <option value="all">All evidence types ({summary.claimCount})</option>
          {CLASSIFICATION_ORDER.map((key) => (
            <option key={key} value={key}>
              {CLASSIFICATION_META[key].label} ({summary.classification[key]})
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-1.5 text-xs text-ink-muted">
        <span className="sr-only sm:not-sr-only">Review state</span>
        <select
          value={filters.reviewStatus}
          onChange={(event) =>
            onChange({
              ...filters,
              reviewStatus: event.target.value as ClaimFilters["reviewStatus"],
            })
          }
          aria-label="Filter by review status"
          className="rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink"
        >
          <option value="all">All review states ({summary.claimCount})</option>
          {REVIEW_STATUS_ORDER.map((key) => (
            <option key={key} value={key}>
              {REVIEW_STATUS_META[key].label} ({summary.reviewStatus[key]})
            </option>
          ))}
        </select>
      </label>

      <p aria-live="polite" className="text-xs text-ink-subtle">
        Showing <span className="font-semibold tabular-nums text-ink">{resultCount}</span> of{" "}
        <span className="tabular-nums">{summary.claimCount}</span> claims
      </p>

      {active > 0 ? (
        <Button variant="ghost" onClick={onReset} className="ml-auto px-2 py-1 text-xs">
          <X aria-hidden className="h-3.5 w-3.5" />
          Clear {active} filter{active > 1 ? "s" : ""}
        </Button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------ claim matrix */

export function ClaimMatrix({
  claims,
  selectedClaimId,
  onSelect,
  onResetFilters,
}: {
  claims: readonly Claim[];
  selectedClaimId?: string | null;
  onSelect: (claim: Claim) => void;
  onResetFilters: () => void;
}) {
  if (claims.length === 0) {
    return (
      <EmptyState
        icon={<FileQuestion aria-hidden className="h-6 w-6" />}
        title="No claims match these filters"
        description="Every claim in this asset is still present — the current combination of filters just excludes all of them."
        action={
          <Button variant="secondary" onClick={onResetFilters}>
            Clear filters
          </Button>
        }
      />
    );
  }

  return (
    <>
      {/* Table at laptop width and above. */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            Claims for this asset, with evidence classification, confidence, assigned reviewer and
            review state. Select a claim to open its evidence.
          </caption>
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wider text-ink-subtle">
              <th scope="col" className="px-4 py-2 font-medium">
                Claim
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Evidence type
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                Records
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Confidence
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Reviewer
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Review state
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Last reviewed
              </th>
              <th scope="col" className="w-8 px-2 py-2">
                <span className="sr-only">Open evidence</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => {
              const selected = claim.id === selectedClaimId;
              return (
                <tr
                  key={claim.id}
                  onClick={() => onSelect(claim)}
                  className={cx(
                    "cursor-pointer border-b border-line align-top transition-colors last:border-b-0",
                    selected ? "bg-accent-soft/60" : "hover:bg-surface-muted",
                  )}
                >
                  <th scope="row" className="max-w-lg px-4 py-3 font-normal">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(claim);
                      }}
                      aria-expanded={selected}
                      className="text-left text-sm leading-snug text-ink hover:underline"
                    >
                      {claim.text}
                    </button>
                    <p className="mt-1 text-[11px] text-ink-subtle">
                      {DOMAIN_META[claim.domain].label}
                    </p>
                  </th>
                  <td className="px-3 py-3">
                    <Badge
                      className={CLASSIFICATION_META[claim.classification].chipClass}
                      title={CLASSIFICATION_META[claim.classification].description}
                    >
                      {CLASSIFICATION_META[claim.classification].label}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-right text-sm tabular-nums text-ink-muted">
                    {claim.evidence.length === 0 ? (
                      <span title="No evidence records address this claim">—</span>
                    ) : (
                      claim.evidence.length
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <Badge
                      className={CONFIDENCE_META[claim.confidence].chipClass}
                      title={CONFIDENCE_META[claim.confidence].description}
                    >
                      {CONFIDENCE_META[claim.confidence].label}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs text-ink-muted">{claim.reviewerType}</td>
                  <td className="px-3 py-3">
                    <Badge className={REVIEW_STATUS_META[claim.reviewStatus].chipClass}>
                      {REVIEW_STATUS_META[claim.reviewStatus].label}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs tabular-nums text-ink-subtle">
                    {claim.lastReviewedAt ? formatTimestamp(claim.lastReviewedAt) : "Never"}
                  </td>
                  <td className="px-2 py-3 text-ink-subtle">
                    <ChevronRight aria-hidden className="h-4 w-4" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stacked cards below laptop width. */}
      <ul className="divide-y divide-line lg:hidden">
        {claims.map((claim) => (
          <li key={claim.id}>
            <button
              type="button"
              onClick={() => onSelect(claim)}
              aria-expanded={claim.id === selectedClaimId}
              className={cx(
                "w-full px-4 py-3 text-left transition-colors",
                claim.id === selectedClaimId ? "bg-accent-soft/60" : "hover:bg-surface-muted",
              )}
            >
              <p className="text-sm leading-snug text-ink">{claim.text}</p>
              <p className="mt-1 text-[11px] text-ink-subtle">{DOMAIN_META[claim.domain].label}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge className={CLASSIFICATION_META[claim.classification].chipClass}>
                  {CLASSIFICATION_META[claim.classification].label}
                </Badge>
                <Badge className={CONFIDENCE_META[claim.confidence].chipClass}>
                  {CONFIDENCE_META[claim.confidence].label}
                </Badge>
                <Badge className={REVIEW_STATUS_META[claim.reviewStatus].chipClass}>
                  {REVIEW_STATUS_META[claim.reviewStatus].label}
                </Badge>
                <span className="text-[11px] text-ink-subtle">
                  {claim.evidence.length === 0
                    ? "No evidence records"
                    : `${claim.evidence.length} record${claim.evidence.length > 1 ? "s" : ""}`}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
