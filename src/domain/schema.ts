import { z } from "zod";

/**
 * DecisionTrace domain model.
 *
 * Every type is validated at runtime with Zod so that a fixture (or, later, a
 * normalized response from an external source adapter) can never enter the UI
 * in a shape the components do not expect.
 */

export const evidenceClassificationSchema = z.enum([
  "direct_support",
  "model_inference",
  "contradiction",
  "missing_evidence",
]);
export type EvidenceClassification = z.infer<typeof evidenceClassificationSchema>;

export const reviewStatusSchema = z.enum([
  "unreviewed",
  "verified",
  "needs_specialist",
  "rejected",
  "superseded",
]);
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

export const confidenceLevelSchema = z.enum(["low", "medium", "high"]);
export type ConfidenceLevel = z.infer<typeof confidenceLevelSchema>;

export const impactLevelSchema = z.enum(["low", "medium", "high"]);
export type ImpactLevel = z.infer<typeof impactLevelSchema>;

export const evidenceRelationshipSchema = z.enum(["supports", "weakens", "context"]);
export type EvidenceRelationship = z.infer<typeof evidenceRelationshipSchema>;

/** The five diligence domains the workspace navigates between. */
export const diligenceDomainSchema = z.enum([
  "biological_rationale",
  "translational_preclinical",
  "clinical_evidence",
  "safety_tolerability",
  "development_operational",
]);
export type DiligenceDomain = z.infer<typeof diligenceDomainSchema>;

export const evidenceItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  sourceType: z.string().min(1),
  publisher: z.string().min(1),
  publishedAt: z.string().min(1),
  url: z.string().url().optional(),
  summary: z.string().min(1),
  relationship: evidenceRelationshipSchema,
  /**
   * `true` for synthetic demonstration evidence. `false` is permitted only for a
   * record that a source adapter actually retrieved and validated.
   */
  isIllustrative: z.boolean(),
  /** Set by a source adapter when a record was fetched from a live public API. */
  retrievedAt: z.string().optional(),
});
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;

export const claimSchema = z.object({
  id: z.string().min(1),
  domain: diligenceDomainSchema,
  text: z.string().min(1),
  classification: evidenceClassificationSchema,
  confidence: confidenceLevelSchema,
  confidenceRationale: z.string().min(1),
  reviewStatus: reviewStatusSchema,
  reviewerType: z.string().min(1),
  /** Why this claim matters to the go/no-go decision. */
  decisionRelevance: z.string().min(1),
  lastReviewedAt: z.string().optional(),
  evidence: z.array(evidenceItemSchema),
});
export type Claim = z.infer<typeof claimSchema>;

export const criticalUnknownSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  impact: impactLevelSchema,
  rationale: z.string().min(1),
  requiredReviewer: z.string().min(1),
  /** Claims whose interpretation would change if this unknown were resolved. */
  linkedClaimIds: z.array(z.string().min(1)),
});
export type CriticalUnknown = z.infer<typeof criticalUnknownSchema>;

export const recommendationSchema = z.object({
  status: z.enum(["investigate", "expert_review", "hold", "reject"]),
  label: z.string().min(1),
  rationale: z.string().min(1),
  /** Derived at runtime from claims; the fixture value is the expected baseline. */
  coveragePercent: z.number().min(0).max(100),
  confidenceLabel: z.string().min(1),
  confidenceExplanation: z.string().min(1),
});
export type Recommendation = z.infer<typeof recommendationSchema>;

export const auditEventSchema = z.object({
  id: z.string().min(1),
  actor: z.string().min(1),
  actorType: z.enum(["agent", "human", "system"]),
  action: z.string().min(1),
  rationale: z.string().min(1),
  timestamp: z.string().min(1),
  claimId: z.string().optional(),
});
export type AuditEvent = z.infer<typeof auditEventSchema>;

export const assetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  indication: z.string().min(1),
  modality: z.string().min(1),
  developmentStage: z.string().min(1),
  ownerStatus: z.string().min(1),
  updatedAt: z.string().min(1),
  isIllustrative: z.boolean(),
  recommendation: recommendationSchema,
  claims: z.array(claimSchema).min(1),
  unknowns: z.array(criticalUnknownSchema).min(1),
  auditEvents: z.array(auditEventSchema),
});
export type Asset = z.infer<typeof assetSchema>;

export function parseAsset(input: unknown): Asset {
  return assetSchema.parse(input);
}
