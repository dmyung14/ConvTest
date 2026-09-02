#!/usr/bin/env node
/**
 * Capture a normalized source snapshot from a running dev server.
 *
 * Goes through the real /api/sources route rather than reimplementing the
 * adapter, so a successful capture proves the whole chain works against the
 * live API: request, upstream schema validation, normalization, and domain
 * re-validation.
 *
 *   npm run dev                                   (terminal 1)
 *   npm run capture:snapshot -- "spinal muscular atrophy"   (terminal 2)
 *
 * Requires DECISIONTRACE_ENABLE_LIVE_SOURCES=true, most easily set by copying
 * .env.example to .env.local.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const term = process.argv.slice(2).join(" ").trim();
const port = process.env.PORT ?? "3000";
const limit = Number(process.env.SNAPSHOT_LIMIT ?? 5);

if (!term) {
  console.error('Usage: npm run capture:snapshot -- "<query term>"');
  process.exit(2);
}

const slug = term
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 60);

const url = `http://localhost:${port}/api/sources?term=${encodeURIComponent(term)}&limit=${limit}`;
console.log(`→ ${url}\n`);

let response;
try {
  response = await fetch(url);
} catch (error) {
  console.error(`✖ Could not reach the dev server on port ${port}.`);
  console.error(`  ${error instanceof Error ? error.message : String(error)}`);
  console.error(`\n  Start it first:  npm run dev`);
  process.exit(1);
}

const body = await response.json().catch(() => null);

if (!body) {
  console.error(`✖ Server returned ${response.status} with a non-JSON body.`);
  process.exit(1);
}

if (body.ok !== true) {
  console.error(`✖ Capture failed — reason: ${body.reason}`);
  console.error(`  ${body.detail ?? ""}\n`);
  switch (body.reason) {
    case "disabled":
      console.error("  The server did not see DECISIONTRACE_ENABLE_LIVE_SOURCES=true.");
      console.error("  Fix: copy .env.example to .env.local, then restart `npm run dev`.");
      break;
    case "invalid_response":
      console.error("  The live response did not match the adapter's expected shape.");
      console.error("  This is a real finding: the schema in src/sources/clinicaltrials.ts");
      console.error("  needs updating. Send the detail above to whoever maintains it.");
      break;
    case "network_unavailable":
    case "timeout":
      console.error("  The request never reached the API. Check connectivity or a proxy.");
      break;
    case "http_error":
      console.error("  The API answered with an error status. It may be down or rate-limiting.");
      break;
  }
  process.exit(1);
}

if (!Array.isArray(body.items) || body.items.length === 0) {
  console.error("✖ The request succeeded but returned no records; nothing to cache.");
  console.error("  Try a broader term.");
  process.exit(1);
}

const snapshot = {
  adapter: body.adapter,
  query: { term, limit },
  retrievedAt: body.retrievedAt,
  items: body.items,
};

const dir = path.join(process.cwd(), "src", "sources", "snapshots");
const file = path.join(dir, `${slug}.json`);
await mkdir(dir, { recursive: true });
await writeFile(file, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

console.log(`✔ Captured ${body.items.length} record(s) from ${body.adapter}`);
console.log(`  retrievedAt: ${body.retrievedAt}`);
console.log(`  written to:  src/sources/snapshots/${slug}.json\n`);
console.log("  First record:");
const first = body.items[0];
console.log(`    ${first.title}`);
console.log(`    ${first.publisher}`);
console.log(`    ${first.url}`);
console.log(`\n  Commit it to make the retrieval path reproducible offline:`);
console.log(
  `    git add src/sources/snapshots/${slug}.json && git commit -m "Add captured source snapshot"`,
);
