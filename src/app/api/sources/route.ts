import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { clinicalTrialsAdapter } from "@/sources/clinicaltrials";
import { SnapshotAdapter, snapshotSlug } from "@/sources/snapshot";

/**
 * Server-side source lookup.
 *
 * Runs on the server so no third-party host, credential or header is ever
 * exposed to the browser. It is not part of the demonstration path: the
 * workspace renders entirely from the local fixture, and this route exists to
 * show where verified evidence would enter.
 *
 * Order of preference:
 *   1. The live adapter, when `DECISIONTRACE_ENABLE_LIVE_SOURCES=true`.
 *   2. A previously captured snapshot for the same term, so the retrieval path
 *      stays demonstrable offline.
 *   3. A typed failure explaining exactly which of those is missing.
 *
 * A failure is never padded out with invented data.
 */

const SNAPSHOT_DIR = path.join(process.cwd(), "src", "sources", "snapshots");

function readSnapshot(slug: string): unknown | undefined {
  const file = path.join(SNAPSHOT_DIR, `${slug}.json`);
  // Guard against a slug escaping the snapshot directory.
  if (!file.startsWith(SNAPSHOT_DIR + path.sep) || !existsSync(file)) return undefined;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return undefined;
  }
}

const snapshotAdapter = new SnapshotAdapter(readSnapshot);

const querySchema = z.object({
  term: z.string().min(2).max(120),
  limit: z.coerce.number().int().min(1).max(25).default(5),
});

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = querySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, reason: "invalid_request", detail: parsed.error.issues[0]?.message },
      { status: 400 },
    );
  }

  const live = await clinicalTrialsAdapter.search(parsed.data);
  if (live.ok) {
    return NextResponse.json(live, { headers: { "cache-control": "no-store" } });
  }

  // Live lookup unavailable — replay a captured snapshot if one exists.
  const cached = await snapshotAdapter.search(parsed.data);
  if (cached.ok) {
    return NextResponse.json(
      { ...cached, note: `Live lookup unavailable (${live.reason}); replayed a cached snapshot.` },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const available = existsSync(SNAPSHOT_DIR)
    ? readdirSync(SNAPSHOT_DIR)
        .filter((entry) => entry.endsWith(".json"))
        .map((entry) => entry.replace(/\.json$/, ""))
    : [];

  return NextResponse.json(
    {
      ...live,
      snapshot: {
        looked_for: snapshotSlug(parsed.data.term),
        available,
        hint:
          available.length === 0
            ? 'No snapshots captured yet. Copy .env.example to .env.local, restart `npm run dev`, then run: npm run capture:snapshot -- "<term>"'
            : "A snapshot exists for a different term; try one of the terms listed in `available`.",
      },
    },
    { status: live.reason === "disabled" ? 503 : 502 },
  );
}
