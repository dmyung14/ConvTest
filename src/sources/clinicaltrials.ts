import { z } from "zod";
import type { EvidenceItem } from "@/domain/schema";
import { evidenceItemSchema } from "@/domain/schema";
import { failure, type SourceAdapter, type SourceQuery, type SourceResult } from "./types";

/**
 * ClinicalTrials.gov API v2 adapter.
 *
 * Public, key-free and documented at https://clinicaltrials.gov/data-api/api.
 * Only the fields needed to render an evidence record are requested, and the
 * response is validated before anything reaches the UI. A registration record
 * is evidence that a study exists — never evidence that it succeeded — so every
 * normalized item is relationship `context`, and its summary says only what the
 * registry states.
 */

const BASE_URL = "https://clinicaltrials.gov/api/v2/studies";
const MAX_LIMIT = 25;
const TIMEOUT_MS = 8000;

/** Only the subset of the v2 payload this adapter relies on. */
const studySchema = z.object({
  protocolSection: z.object({
    identificationModule: z.object({
      nctId: z.string().regex(/^NCT\d{8}$/, "not a well-formed NCT identifier"),
      briefTitle: z.string().min(1),
    }),
    statusModule: z
      .object({
        overallStatus: z.string().optional(),
        startDateStruct: z.object({ date: z.string().optional() }).optional(),
      })
      .optional(),
    sponsorCollaboratorsModule: z
      .object({ leadSponsor: z.object({ name: z.string().optional() }).optional() })
      .optional(),
    designModule: z.object({ studyType: z.string().optional() }).optional(),
  }),
});

const responseSchema = z.object({ studies: z.array(studySchema).default([]) });

type Study = z.infer<typeof studySchema>;

/**
 * Normalize one registry record. Every field is taken from the response — no
 * value is inferred, and a missing field becomes an explicit "not stated"
 * rather than a plausible guess.
 */
export function normalizeStudy(study: Study, retrievedAt: string): EvidenceItem {
  const { identificationModule, statusModule, sponsorCollaboratorsModule, designModule } =
    study.protocolSection;
  const nctId = identificationModule.nctId;
  const status = statusModule?.overallStatus ?? "status not stated in the registry record";
  const studyType = designModule?.studyType ?? "study type not stated";
  const sponsor = sponsorCollaboratorsModule?.leadSponsor?.name ?? "Sponsor not stated";
  const startDate = statusModule?.startDateStruct?.date;

  return {
    id: `ctgov-${nctId}`,
    title: identificationModule.briefTitle,
    sourceType: "Clinical trial registration",
    publisher: `ClinicalTrials.gov · lead sponsor: ${sponsor}`,
    publishedAt: startDate ?? "Start date not stated",
    url: `https://clinicaltrials.gov/study/${nctId}`,
    summary: `Registry record ${nctId}. Overall status: ${status}. Study type: ${studyType}. A registration record establishes that a study was registered and what it claims to measure — it is not evidence of a result.`,
    relationship: "context",
    isIllustrative: false,
    retrievedAt,
  };
}

export class ClinicalTrialsAdapter implements SourceAdapter {
  readonly id = "clinicaltrials-gov-v2";
  readonly name = "ClinicalTrials.gov (API v2)";

  constructor(private readonly fetchImpl: typeof fetch = globalThis.fetch) {}

  /**
   * Enabled only when explicitly switched on. Off by default so the demo never
   * depends on an outbound request, and so a sandbox with no egress does not
   * present a broken control.
   */
  isEnabled(): boolean {
    return process.env.DECISIONTRACE_ENABLE_LIVE_SOURCES === "true";
  }

  async search({ term, limit = 5, signal }: SourceQuery): Promise<SourceResult> {
    if (!this.isEnabled()) {
      return failure(
        this.id,
        "disabled",
        "Live sources are disabled. Set DECISIONTRACE_ENABLE_LIVE_SOURCES=true to enable this adapter. The illustrative fixture is unaffected.",
      );
    }

    const url = new URL(BASE_URL);
    url.searchParams.set("query.cond", term);
    url.searchParams.set("pageSize", String(Math.min(Math.max(1, limit), MAX_LIMIT)));
    url.searchParams.set("format", "json");

    const timeout = AbortSignal.timeout(TIMEOUT_MS);
    const composite = signal ? AbortSignal.any([signal, timeout]) : timeout;

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        signal: composite,
        headers: { accept: "application/json" },
      });
    } catch (error) {
      const reason = timeout.aborted ? "timeout" : "network_unavailable";
      return failure(this.id, reason, describe(error));
    }

    if (!response.ok) {
      return failure(this.id, "http_error", `ClinicalTrials.gov responded ${response.status}.`);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      return failure(
        this.id,
        "invalid_response",
        `Response was not valid JSON: ${describe(error)}`,
      );
    }

    const parsed = responseSchema.safeParse(payload);
    if (!parsed.success) {
      return failure(
        this.id,
        "invalid_response",
        `Response did not match the expected v2 shape: ${parsed.error.issues[0]?.message ?? "unknown"}`,
      );
    }

    const retrievedAt = new Date().toISOString();

    // Re-validate each normalized record against the domain schema. A record
    // that fails is dropped, never patched into shape.
    const items = parsed.data.studies
      .map((study) => evidenceItemSchema.safeParse(normalizeStudy(study, retrievedAt)))
      .filter((result) => result.success)
      .map((result) => result.data);

    return { ok: true, adapter: this.id, retrievedAt, items };
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const clinicalTrialsAdapter = new ClinicalTrialsAdapter();
