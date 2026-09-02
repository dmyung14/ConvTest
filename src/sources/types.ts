import type { EvidenceItem } from "@/domain/schema";

/**
 * Source adapters are the only path by which non-illustrative evidence can
 * enter DecisionTrace.
 *
 * The contract is deliberately narrow: an adapter either returns records it
 * actually retrieved and validated, or it fails. It may never invent a record,
 * and it may never mark a record `isIllustrative: false` unless that record was
 * fetched from the named public API and passed schema validation with a usable
 * canonical URL. The deterministic fixture remains the default demonstration
 * path whether or not any adapter is reachable.
 */
export interface SourceQuery {
  /** Free-text condition or topic. */
  term: string;
  /** Upper bound on records returned. Adapters clamp this to their own limit. */
  limit?: number;
  /** Abort signal so a slow public API cannot hang a request. */
  signal?: AbortSignal;
}

export type SourceResult =
  | { ok: true; adapter: string; retrievedAt: string; items: EvidenceItem[] }
  | { ok: false; adapter: string; reason: SourceFailureReason; detail: string };

export type SourceFailureReason =
  "disabled" | "network_unavailable" | "http_error" | "invalid_response" | "timeout";

export interface SourceAdapter {
  /** Stable identifier used in logs and in the UI's provenance labels. */
  readonly id: string;
  /** Human-readable name shown beside a retrieved record. */
  readonly name: string;
  /** Whether this adapter is usable in the current environment. */
  isEnabled(): boolean;
  search(query: SourceQuery): Promise<SourceResult>;
}

export function failure(
  adapter: string,
  reason: SourceFailureReason,
  detail: string,
): Extract<SourceResult, { ok: false }> {
  return { ok: false, adapter, reason, detail };
}
