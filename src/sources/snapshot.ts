import { z } from "zod";
import { evidenceItemSchema } from "@/domain/schema";
import { failure, type SourceAdapter, type SourceQuery, type SourceResult } from "./types";

/**
 * Cached, normalized source snapshots.
 *
 * The brief asks for successful responses to be cached locally so the
 * demonstration is reproducible. A snapshot stores the *normalized* evidence
 * items, not the raw upstream payload, so what is replayed is exactly what the
 * adapter would have produced.
 *
 * A snapshot is honest evidence: its records really were retrieved from the
 * named public API at `retrievedAt`, which is why they may keep
 * `isIllustrative: false`. Nothing may be hand-written into a snapshot file —
 * they are only ever produced by `npm run capture:snapshot`, which requires a
 * successful live response.
 */

export const sourceSnapshotSchema = z.object({
  adapter: z.string().min(1),
  /** The query that produced this snapshot, so it can be reproduced. */
  query: z.object({ term: z.string().min(1), limit: z.number().int().positive() }),
  /** When the live request succeeded. */
  retrievedAt: z.string().min(1),
  items: z.array(evidenceItemSchema),
});

export type SourceSnapshot = z.infer<typeof sourceSnapshotSchema>;

/** Filesystem-safe key for a query term. */
export function snapshotSlug(term: string): string {
  return term
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function parseSnapshot(input: unknown): SourceSnapshot {
  const snapshot = sourceSnapshotSchema.parse(input);
  // A snapshot exists to prove retrieval happened; a record claiming to be
  // retrieved must carry the evidence of it.
  for (const item of snapshot.items) {
    if (!item.isIllustrative && !item.retrievedAt) {
      throw new Error(`snapshot item ${item.id} claims to be verified but has no retrievedAt`);
    }
  }
  return snapshot;
}

/**
 * Replays a captured snapshot. Used when live sources are disabled but a
 * snapshot for the query exists, so the retrieval path stays demonstrable
 * offline and without enabling outbound requests.
 */
export class SnapshotAdapter implements SourceAdapter {
  readonly id = "snapshot";
  readonly name = "Cached source snapshot";

  constructor(private readonly load: (slug: string) => unknown | undefined) {}

  isEnabled(): boolean {
    return true;
  }

  async search({ term }: SourceQuery): Promise<SourceResult> {
    const raw = this.load(snapshotSlug(term));
    if (raw === undefined) {
      return failure(
        this.id,
        "disabled",
        `No cached snapshot for "${term}". Enable live sources and run \`npm run capture:snapshot\` to create one.`,
      );
    }

    try {
      const snapshot = parseSnapshot(raw);
      return {
        ok: true,
        adapter: `${snapshot.adapter} (cached snapshot)`,
        retrievedAt: snapshot.retrievedAt,
        items: snapshot.items,
      };
    } catch (error) {
      return failure(
        this.id,
        "invalid_response",
        `Cached snapshot failed validation: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
