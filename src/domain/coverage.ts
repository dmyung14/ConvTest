import type { Asset, Claim, DiligenceDomain, EvidenceClassification, ReviewStatus } from "./schema";

/**
 * Evidence coverage weights.
 *
 * Coverage answers one narrow question: *how much of this asset's claim set is
 * backed by evidence a reviewer can actually inspect?* It is deliberately not a
 * probability of technical or regulatory success, and it is not a scientific
 * score. Each claim contributes a fixed weight determined only by how its
 * supporting evidence is classified:
 *
 * - `direct_support`   1.00 — a sourced record supports the claim.
 * - `model_inference`  0.50 — reasoning over adjacent evidence, not a source for the claim itself.
 * - `contradiction`    0.25 — sources exist but disagree, so the claim is not settled.
 * - `missing_evidence` 0.00 — nothing in the bundle addresses the claim.
 *
 * coveragePercent = round( 100 * Σ weight(claim) / claimCount )
 *
 * Rounding is half-up on the final percentage only. An asset with no claims has
 * 0% coverage rather than an undefined value.
 */
export const COVERAGE_WEIGHTS: Record<EvidenceClassification, number> = {
  direct_support: 1,
  model_inference: 0.5,
  contradiction: 0.25,
  missing_evidence: 0,
};

export function claimCoverageWeight(claim: Pick<Claim, "classification">): number {
  return COVERAGE_WEIGHTS[claim.classification];
}

export function calculateCoveragePercent(claims: readonly Pick<Claim, "classification">[]): number {
  if (claims.length === 0) return 0;
  const total = claims.reduce((sum, claim) => sum + claimCoverageWeight(claim), 0);
  return Math.round((total / claims.length) * 100);
}

export type ClassificationCounts = Record<EvidenceClassification, number>;
export type ReviewStatusCounts = Record<ReviewStatus, number>;
export type DomainCounts = Record<DiligenceDomain, number>;

export function countByClassification(
  claims: readonly Pick<Claim, "classification">[],
): ClassificationCounts {
  const counts: ClassificationCounts = {
    direct_support: 0,
    model_inference: 0,
    contradiction: 0,
    missing_evidence: 0,
  };
  for (const claim of claims) counts[claim.classification] += 1;
  return counts;
}

export function countByReviewStatus(
  claims: readonly Pick<Claim, "reviewStatus">[],
): ReviewStatusCounts {
  const counts: ReviewStatusCounts = {
    unreviewed: 0,
    verified: 0,
    needs_specialist: 0,
    rejected: 0,
    superseded: 0,
  };
  for (const claim of claims) counts[claim.reviewStatus] += 1;
  return counts;
}

export function countByDomain(claims: readonly Pick<Claim, "domain">[]): DomainCounts {
  const counts: DomainCounts = {
    biological_rationale: 0,
    translational_preclinical: 0,
    clinical_evidence: 0,
    safety_tolerability: 0,
    development_operational: 0,
  };
  for (const claim of claims) counts[claim.domain] += 1;
  return counts;
}

/**
 * Share of claims a human has acted on (anything other than `unreviewed`).
 * Reported separately from coverage: reviewing a claim does not create evidence.
 */
export function calculateReviewedPercent(claims: readonly Pick<Claim, "reviewStatus">[]): number {
  if (claims.length === 0) return 0;
  const reviewed = claims.filter((claim) => claim.reviewStatus !== "unreviewed").length;
  return Math.round((reviewed / claims.length) * 100);
}

export function countEvidenceItems(claims: readonly Pick<Claim, "evidence">[]): number {
  return claims.reduce((sum, claim) => sum + claim.evidence.length, 0);
}

export interface AssetSummary {
  claimCount: number;
  evidenceCount: number;
  coveragePercent: number;
  reviewedPercent: number;
  classification: ClassificationCounts;
  reviewStatus: ReviewStatusCounts;
  domain: DomainCounts;
  highImpactUnknownCount: number;
}

export function summarizeAsset(asset: Pick<Asset, "claims" | "unknowns">): AssetSummary {
  return {
    claimCount: asset.claims.length,
    evidenceCount: countEvidenceItems(asset.claims),
    coveragePercent: calculateCoveragePercent(asset.claims),
    reviewedPercent: calculateReviewedPercent(asset.claims),
    classification: countByClassification(asset.claims),
    reviewStatus: countByReviewStatus(asset.claims),
    domain: countByDomain(asset.claims),
    highImpactUnknownCount: asset.unknowns.filter((unknown) => unknown.impact === "high").length,
  };
}

const IMPACT_RANK: Record<"high" | "medium" | "low", number> = { high: 0, medium: 1, low: 2 };

/** Unknowns ordered by potential effect on the recommendation, highest first. */
export function rankUnknowns<T extends { impact: "low" | "medium" | "high" }>(
  unknowns: readonly T[],
): T[] {
  return [...unknowns].sort((a, b) => IMPACT_RANK[a.impact] - IMPACT_RANK[b.impact]);
}
