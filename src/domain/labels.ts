import type {
  ConfidenceLevel,
  DiligenceDomain,
  EvidenceClassification,
  EvidenceRelationship,
  ImpactLevel,
  ReviewStatus,
} from "./schema";

/**
 * Display metadata. Every status carries a text label — colour is never the only
 * signal — plus a short definition used in tooltips, the memo and /methodology.
 */

export interface TokenMeta {
  label: string;
  short: string;
  description: string;
  /** Tailwind utility classes for the badge chip. */
  chipClass: string;
}

export const CLASSIFICATION_META: Record<EvidenceClassification, TokenMeta> = {
  direct_support: {
    label: "Sourced fact",
    short: "Sourced",
    description:
      "A retrievable record states this directly. The reviewer can open the source and check it.",
    chipClass: "bg-accent-soft text-accent-ink border-accent/30",
  },
  model_inference: {
    label: "Model inference",
    short: "Inferred",
    description:
      "No source states this. A model reasoned from adjacent evidence, so the step itself is the thing to review.",
    chipClass: "bg-slate-soft text-slate border-slate/30",
  },
  contradiction: {
    label: "Contradiction",
    short: "Conflict",
    description:
      "At least two sources disagree. The claim is unsettled until a specialist adjudicates.",
    chipClass: "bg-danger-soft text-danger border-danger/30",
  },
  missing_evidence: {
    label: "Missing evidence",
    short: "Missing",
    description:
      "Nothing in the bundle addresses this claim. The gap is stated rather than filled in.",
    chipClass: "bg-amber-soft text-amber border-amber/30",
  },
};

export const REVIEW_STATUS_META: Record<ReviewStatus, TokenMeta> = {
  unreviewed: {
    label: "Unreviewed",
    short: "Unreviewed",
    description: "No human has acted on this claim yet.",
    chipClass: "bg-surface-muted text-ink-muted border-line-strong",
  },
  verified: {
    label: "Verified",
    short: "Verified",
    description: "A reviewer checked the evidence and accepts the claim as stated.",
    chipClass: "bg-accent-soft text-accent-ink border-accent/30",
  },
  needs_specialist: {
    label: "Needs specialist",
    short: "Specialist",
    description: "Escalated: resolving this requires a named domain expert.",
    chipClass: "bg-amber-soft text-amber border-amber/30",
  },
  rejected: {
    label: "Rejected",
    short: "Rejected",
    description: "A reviewer judged the claim unsupported by its evidence.",
    chipClass: "bg-danger-soft text-danger border-danger/30",
  },
  superseded: {
    label: "Superseded",
    short: "Superseded",
    description: "Newer evidence replaces this claim; kept for the audit trail.",
    chipClass: "bg-slate-soft text-slate border-slate/30",
  },
};

export const CONFIDENCE_META: Record<ConfidenceLevel, TokenMeta> = {
  high: {
    label: "High confidence",
    short: "High",
    description: "Multiple independent records agree and the reasoning step is short.",
    chipClass: "bg-accent-soft text-accent-ink border-accent/30",
  },
  medium: {
    label: "Medium confidence",
    short: "Medium",
    description: "Supported, but with a material assumption or a single source.",
    chipClass: "bg-slate-soft text-slate border-slate/30",
  },
  low: {
    label: "Low confidence",
    short: "Low",
    description: "Thin, conflicting or absent evidence. Treat as an open question.",
    chipClass: "bg-amber-soft text-amber border-amber/30",
  },
};

export const IMPACT_META: Record<ImpactLevel, TokenMeta> = {
  high: {
    label: "High impact",
    short: "High",
    description: "Resolving this could change the recommendation on its own.",
    chipClass: "bg-danger-soft text-danger border-danger/30",
  },
  medium: {
    label: "Medium impact",
    short: "Medium",
    description: "Resolving this would meaningfully change confidence or sequencing.",
    chipClass: "bg-amber-soft text-amber border-amber/30",
  },
  low: {
    label: "Low impact",
    short: "Low",
    description: "Worth tracking, but unlikely to move the decision by itself.",
    chipClass: "bg-slate-soft text-slate border-slate/30",
  },
};

export const RELATIONSHIP_META: Record<EvidenceRelationship, TokenMeta> = {
  supports: {
    label: "Supports",
    short: "Supports",
    description: "This record makes the claim more likely to hold.",
    chipClass: "bg-accent-soft text-accent-ink border-accent/30",
  },
  weakens: {
    label: "Weakens",
    short: "Weakens",
    description: "This record cuts against the claim as written.",
    chipClass: "bg-danger-soft text-danger border-danger/30",
  },
  context: {
    label: "Context",
    short: "Context",
    description: "Background needed to read the other records correctly.",
    chipClass: "bg-slate-soft text-slate border-slate/30",
  },
};

export interface DomainMeta {
  label: string;
  short: string;
  description: string;
}

export const DOMAIN_META: Record<DiligenceDomain, DomainMeta> = {
  biological_rationale: {
    label: "Biological rationale",
    short: "Biology",
    description: "Does the target–disease link hold in humans, not only in a model system?",
  },
  translational_preclinical: {
    label: "Translational & preclinical",
    short: "Preclinical",
    description: "Do the in vivo data predict anything about human benefit?",
  },
  clinical_evidence: {
    label: "Clinical evidence",
    short: "Clinical",
    description: "What has been shown in people, and with what endpoints?",
  },
  safety_tolerability: {
    label: "Safety & tolerability",
    short: "Safety",
    description: "What is known, and unknown, about harm at a therapeutic dose?",
  },
  development_operational: {
    label: "Development & operational risk",
    short: "Operations",
    description: "Can this actually be manufactured, enrolled and run?",
  },
};

export const DOMAIN_ORDER: DiligenceDomain[] = [
  "biological_rationale",
  "translational_preclinical",
  "clinical_evidence",
  "safety_tolerability",
  "development_operational",
];

export const CLASSIFICATION_ORDER: EvidenceClassification[] = [
  "direct_support",
  "model_inference",
  "contradiction",
  "missing_evidence",
];

export const REVIEW_STATUS_ORDER: ReviewStatus[] = [
  "unreviewed",
  "verified",
  "needs_specialist",
  "rejected",
  "superseded",
];

/** Deterministic, locale-stable timestamp formatting (avoids SSR/client drift). */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  }).format(date);
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).format(date);
}
