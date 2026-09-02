"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Asset, AuditEvent, Claim, ReviewStatus } from "@/domain/schema";
import { summarizeAsset } from "@/domain/coverage";

/**
 * Demonstration review state.
 *
 * Review actions live in a small external store mirrored to `localStorage`, so
 * a reload does not lose the reviewer's work mid-demo. Only the mutable part is
 * persisted — review statuses and the audit events a human generated — leaving
 * the fixture as the single source of truth for everything else, so a fixture
 * edit can never be shadowed by stale storage.
 *
 * `useSyncExternalStore` is used rather than an effect that seeds state after
 * mount: the server snapshot is deliberately the pristine fixture state, and
 * React swaps in the stored snapshot after hydration without a mismatch.
 */

const STORAGE_VERSION = 1;
const STORAGE_KEY = "decisiontrace.review.v1";

/** The reviewer identity a demo session acts as. */
export const DEMO_REVIEWER = "You (diligence lead)";

export interface ReviewMutation {
  reviewStatus: ReviewStatus;
  rationale: string;
  timestamp: string;
}

export interface ReviewState {
  reviews: Record<string, ReviewMutation>;
  events: AuditEvent[];
}

interface PersistedState extends ReviewState {
  version: number;
  assetId: string;
}

const EMPTY_STATE: ReviewState = { reviews: {}, events: [] };

function isPersistedState(value: unknown): value is PersistedState {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<PersistedState>;
  return (
    candidate.version === STORAGE_VERSION &&
    typeof candidate.assetId === "string" &&
    typeof candidate.reviews === "object" &&
    candidate.reviews !== null &&
    Array.isArray(candidate.events)
  );
}

function readStorage(assetId: string): ReviewState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (isPersistedState(parsed) && parsed.assetId === assetId) {
      return { reviews: parsed.reviews, events: parsed.events };
    }
  } catch {
    // Private mode, quota, or a corrupt payload: fall back to the pristine fixture.
  }
  return EMPTY_STATE;
}

function writeStorage(assetId: string, state: ReviewState): void {
  if (typeof window === "undefined") return;
  try {
    if (state === EMPTY_STATE) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const payload: PersistedState = { version: STORAGE_VERSION, assetId, ...state };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Persistence is a convenience; never let it break the demo.
  }
}

/* ------------------------------------------------------------ the store */

let assetKey = "";
let state: ReviewState = EMPTY_STATE;
let initialized = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function ensureInitialized(assetId: string): void {
  if (initialized && assetKey === assetId) return;
  assetKey = assetId;
  state = readStorage(assetId);
  initialized = true;
}

function setState(next: ReviewState): void {
  state = next;
  writeStorage(assetKey, next);
  emit();
}

/** Test-only reset so a test file starts from a known store. */
export function __resetStoreForTests(): void {
  assetKey = "";
  state = EMPTY_STATE;
  initialized = false;
  listeners.clear();
}

/* ------------------------------------------------------------ vocabulary */

export const REVIEW_ACTION_LABEL: Record<Exclude<ReviewStatus, "unreviewed">, string> = {
  verified: "Marked claim verified",
  needs_specialist: "Escalated claim for specialist review",
  rejected: "Rejected claim",
  superseded: "Marked claim superseded",
};

/**
 * Actions a reviewer must explain. Verifying or escalating a claim is
 * self-explanatory from the evidence; rejecting or superseding one overrides
 * the evidence, and an audit trail full of unexplained overrides is worthless.
 */
export const RATIONALE_REQUIRED: ReviewStatus[] = ["rejected", "superseded"];

export function isRationaleRequired(status: ReviewStatus): boolean {
  return RATIONALE_REQUIRED.includes(status);
}

/* ---------------------------------------------------------------- hook */

export function useWorkspaceState(baseAsset: Asset) {
  ensureInitialized(baseAsset.id);

  const reviewState = useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY_STATE,
  );

  /** The fixture with reviewer mutations applied. Never mutates the fixture. */
  const asset: Asset = useMemo(() => {
    const { reviews, events } = reviewState;
    if (Object.keys(reviews).length === 0 && events.length === 0) return baseAsset;
    const claims: Claim[] = baseAsset.claims.map((claim) => {
      const mutation = reviews[claim.id];
      if (!mutation) return claim;
      return { ...claim, reviewStatus: mutation.reviewStatus, lastReviewedAt: mutation.timestamp };
    });
    return { ...baseAsset, claims, auditEvents: [...baseAsset.auditEvents, ...events] };
  }, [baseAsset, reviewState]);

  const summary = useMemo(() => summarizeAsset(asset), [asset]);

  const reviewClaim = useCallback(
    (claimId: string, reviewStatus: ReviewStatus, rationale: string) => {
      if (!baseAsset.claims.some((claim) => claim.id === claimId)) return;
      const timestamp = new Date().toISOString();
      const trimmed = rationale.trim();

      const reviews = { ...state.reviews };
      if (reviewStatus === "unreviewed") {
        delete reviews[claimId];
      } else {
        reviews[claimId] = { reviewStatus, rationale: trimmed, timestamp };
      }

      const event: AuditEvent = {
        id: `aud-local-${state.events.length + 1}-${claimId}`,
        actor: DEMO_REVIEWER,
        actorType: "human",
        action:
          reviewStatus === "unreviewed"
            ? "Cleared review state"
            : REVIEW_ACTION_LABEL[reviewStatus],
        rationale:
          trimmed ||
          "No rationale recorded. The reviewer left this blank, and the audit trail says so rather than inventing one.",
        timestamp,
        claimId,
      };

      setState({ reviews, events: [...state.events, event] });
    },
    [baseAsset.claims],
  );

  const resetDemo = useCallback(() => {
    setState(EMPTY_STATE);
  }, []);

  return {
    asset,
    summary,
    reviews: reviewState.reviews,
    reviewerEventCount: reviewState.events.length,
    reviewClaim,
    resetDemo,
  };
}

export type WorkspaceState = ReturnType<typeof useWorkspaceState>;
