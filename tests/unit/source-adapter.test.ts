import { afterEach, describe, expect, it, vi } from "vitest";
import { ClinicalTrialsAdapter, normalizeStudy } from "@/sources/clinicaltrials";
import { evidenceItemSchema } from "@/domain/schema";
import { getDemoAsset } from "@/data";

const ENV_KEY = "DECISIONTRACE_ENABLE_LIVE_SOURCES";

function enableLiveSources() {
  vi.stubEnv(ENV_KEY, "true");
}

/** A minimal, well-formed v2 payload shaped like the documented response. */
const validPayload = {
  studies: [
    {
      protocolSection: {
        identificationModule: { nctId: "NCT01234567", briefTitle: "A registered study" },
        statusModule: { overallStatus: "COMPLETED", startDateStruct: { date: "2021-04" } },
        sponsorCollaboratorsModule: { leadSponsor: { name: "A sponsor" } },
        designModule: { studyType: "INTERVENTIONAL" },
      },
    },
  ],
};

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("ClinicalTrialsAdapter — availability", () => {
  it("is disabled by default so the demo never depends on egress", async () => {
    const adapter = new ClinicalTrialsAdapter(vi.fn());
    expect(adapter.isEnabled()).toBe(false);
    const result = await adapter.search({ term: "anything" });
    expect(result).toMatchObject({ ok: false, reason: "disabled" });
  });

  it("does not call the network while disabled", async () => {
    const fetchImpl = vi.fn();
    await new ClinicalTrialsAdapter(fetchImpl).search({ term: "anything" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("requires no API key or secret", () => {
    const source = new ClinicalTrialsAdapter(vi.fn());
    expect(JSON.stringify(source)).not.toMatch(/key|token|secret/i);
  });
});

describe("ClinicalTrialsAdapter — retrieval", () => {
  it("queries the documented v2 endpoint with the requested term and a clamped limit", async () => {
    enableLiveSources();
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(validPayload));
    await new ClinicalTrialsAdapter(fetchImpl).search({ term: "a condition", limit: 500 });

    const url = fetchImpl.mock.calls[0][0] as URL;
    expect(url.origin + url.pathname).toBe("https://clinicaltrials.gov/api/v2/studies");
    expect(url.searchParams.get("query.cond")).toBe("a condition");
    expect(url.searchParams.get("pageSize")).toBe("25");
  });

  it("normalizes a study into a valid, verified evidence item", async () => {
    enableLiveSources();
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(validPayload));
    const result = await new ClinicalTrialsAdapter(fetchImpl).search({ term: "x" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items).toHaveLength(1);

    const item = result.items[0];
    expect(() => evidenceItemSchema.parse(item)).not.toThrow();
    expect(item.isIllustrative).toBe(false);
    expect(item.url).toBe("https://clinicaltrials.gov/study/NCT01234567");
    expect(item.retrievedAt).toBeTruthy();
    // A registration is context, never proof of a result.
    expect(item.relationship).toBe("context");
    expect(item.summary).toContain("not evidence of a result");
  });

  it("says a field is not stated rather than inventing a plausible value", () => {
    const bare = {
      protocolSection: {
        identificationModule: { nctId: "NCT00000001", briefTitle: "Sparse record" },
      },
    };
    const item = normalizeStudy(bare, "2026-09-02T00:00:00Z");
    expect(item.publisher).toContain("Sponsor not stated");
    expect(item.publishedAt).toBe("Start date not stated");
    expect(item.summary).toContain("status not stated");
  });
});

describe("ClinicalTrialsAdapter — failure handling", () => {
  it("reports a network failure instead of throwing", async () => {
    enableLiveSources();
    const fetchImpl = vi.fn().mockRejectedValue(new Error("getaddrinfo ENOTFOUND"));
    const result = await new ClinicalTrialsAdapter(fetchImpl).search({ term: "x" });
    expect(result).toMatchObject({ ok: false, reason: "network_unavailable" });
  });

  it("reports an HTTP error", async () => {
    enableLiveSources();
    const fetchImpl = vi.fn().mockResolvedValue(new Response("nope", { status: 502 }));
    const result = await new ClinicalTrialsAdapter(fetchImpl).search({ term: "x" });
    expect(result).toMatchObject({ ok: false, reason: "http_error" });
  });

  it("rejects a response that is not JSON", async () => {
    enableLiveSources();
    const fetchImpl = vi.fn().mockResolvedValue(new Response("<html>", { status: 200 }));
    const result = await new ClinicalTrialsAdapter(fetchImpl).search({ term: "x" });
    expect(result).toMatchObject({ ok: false, reason: "invalid_response" });
  });

  it("rejects a response that does not match the expected shape", async () => {
    enableLiveSources();
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ studies: [{ wrong: true }] }));
    const result = await new ClinicalTrialsAdapter(fetchImpl).search({ term: "x" });
    expect(result).toMatchObject({ ok: false, reason: "invalid_response" });
  });

  it("drops a malformed record rather than patching it into shape", async () => {
    enableLiveSources();
    const mixed = {
      studies: [
        validPayload.studies[0],
        {
          protocolSection: {
            // A bad identifier must never become a linked, 'verified' source.
            identificationModule: { nctId: "NOT-AN-NCT-ID", briefTitle: "Bad record" },
          },
        },
      ],
    };
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(mixed));
    const result = await new ClinicalTrialsAdapter(fetchImpl).search({ term: "x" });
    // The whole response is rejected because one study fails the response schema.
    expect(result.ok).toBe(false);
  });
});

describe("the fixture stays the default path", () => {
  it("renders the demo without any adapter and marks all of its evidence illustrative", () => {
    const asset = getDemoAsset();
    const items = asset.claims.flatMap((claim) => claim.evidence);
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.isIllustrative)).toBe(true);
    expect(items.every((item) => item.retrievedAt === undefined)).toBe(true);
  });
});
