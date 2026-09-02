import { NextResponse } from "next/server";
import { z } from "zod";
import { clinicalTrialsAdapter } from "@/sources/clinicaltrials";

/**
 * Server-side source lookup.
 *
 * Runs on the server so no third-party host, credential or header is ever
 * exposed to the browser. It is not part of the demonstration path: the
 * workspace renders entirely from the local fixture, and this route exists to
 * show where verified evidence would enter. It is disabled unless
 * `DECISIONTRACE_ENABLE_LIVE_SOURCES=true`, and a failure returns a plain
 * explanation rather than a fabricated result.
 */

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

  const result = await clinicalTrialsAdapter.search(parsed.data);

  if (!result.ok) {
    // 503 for "not available right now", 200-with-ok:false would hide a real outage.
    const status = result.reason === "disabled" ? 503 : 502;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result, {
    headers: { "cache-control": "no-store" },
  });
}
