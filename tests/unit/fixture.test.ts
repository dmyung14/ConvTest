import { describe, expect, it } from "vitest";
import { assetSchema } from "@/domain/schema";
import { CLASSIFICATION_ORDER, DOMAIN_ORDER } from "@/domain/labels";
import { demoAsset } from "@/data/demo-asset";
import { getDemoAsset } from "@/data";

describe("demo fixture integrity", () => {
  it("passes schema validation", () => {
    expect(() => assetSchema.parse(demoAsset)).not.toThrow();
  });

  it("is loaded through a validating accessor", () => {
    expect(getDemoAsset().id).toBe("demo-asset");
  });

  const asset = getDemoAsset();

  it("carries at least 12 claims", () => {
    expect(asset.claims.length).toBeGreaterThanOrEqual(12);
  });

  it("covers all five diligence domains", () => {
    const domains = new Set(asset.claims.map((claim) => claim.domain));
    for (const domain of DOMAIN_ORDER) {
      expect(domains.has(domain), `missing domain: ${domain}`).toBe(true);
    }
  });

  it("exercises all four evidence classifications", () => {
    const classifications = new Set(asset.claims.map((claim) => claim.classification));
    for (const classification of CLASSIFICATION_ORDER) {
      expect(classifications.has(classification), `missing: ${classification}`).toBe(true);
    }
  });

  it("includes at least three decision-critical unknowns, three of them high impact", () => {
    expect(asset.unknowns.length).toBeGreaterThanOrEqual(3);
    expect(asset.unknowns.filter((u) => u.impact === "high").length).toBeGreaterThanOrEqual(3);
  });

  it("includes agent, system and human audit events", () => {
    const actorTypes = new Set(asset.auditEvents.map((event) => event.actorType));
    expect(actorTypes).toEqual(new Set(["agent", "system", "human"]));
  });

  it("uses unique ids for claims, evidence, unknowns and audit events", () => {
    const ids = [
      ...asset.claims.map((c) => c.id),
      ...asset.claims.flatMap((c) => c.evidence.map((e) => e.id)),
      ...asset.unknowns.map((u) => u.id),
      ...asset.auditEvents.map((e) => e.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("links every unknown to claims that exist", () => {
    const claimIds = new Set(asset.claims.map((claim) => claim.id));
    for (const unknown of asset.unknowns) {
      expect(unknown.linkedClaimIds.length).toBeGreaterThan(0);
      for (const id of unknown.linkedClaimIds) {
        expect(claimIds.has(id), `unknown ${unknown.id} links to unknown claim ${id}`).toBe(true);
      }
    }
  });

  it("links every claim-scoped audit event to a claim that exists", () => {
    const claimIds = new Set(asset.claims.map((claim) => claim.id));
    for (const event of asset.auditEvents) {
      if (event.claimId) expect(claimIds.has(event.claimId)).toBe(true);
    }
  });
});

describe("scientific-safety rules for illustrative data", () => {
  const asset = getDemoAsset();
  const serialized = JSON.stringify(asset);

  it("marks the asset and every evidence item as illustrative", () => {
    expect(asset.isIllustrative).toBe(true);
    for (const claim of asset.claims) {
      for (const item of claim.evidence) {
        expect(item.isIllustrative, `${item.id} is not marked illustrative`).toBe(true);
      }
    }
  });

  it("contains no fabricated external identifiers", () => {
    // PubMed IDs, DOIs, and clinical-trial registry numbers must never be invented.
    expect(serialized).not.toMatch(/\bPMID\b/i);
    expect(serialized).not.toMatch(/\bdoi[:\s/]/i);
    expect(serialized).not.toMatch(/\bNCT\d/i);
    expect(serialized).not.toMatch(/\bEudraCT\b/i);
    expect(serialized).not.toMatch(/\bISRCTN\b/i);
  });

  it("attaches no source URLs to illustrative evidence", () => {
    for (const claim of asset.claims) {
      for (const item of claim.evidence) {
        // A URL would imply a retrievable record; illustrative records have none.
        expect(item.url, `${item.id} carries a URL`).toBeUndefined();
      }
    }
  });

  it("labels every claim it cannot evidence as missing rather than inferring a value", () => {
    for (const claim of asset.claims) {
      if (claim.classification === "missing_evidence") {
        expect(claim.evidence).toHaveLength(0);
      } else {
        expect(claim.evidence.length, `${claim.id} has no evidence`).toBeGreaterThan(0);
      }
    }
  });

  it("gives every contradiction at least one weakening record", () => {
    for (const claim of asset.claims) {
      if (claim.classification === "contradiction") {
        expect(
          claim.evidence.some((item) => item.relationship === "weakens"),
          `${claim.id} is a contradiction with nothing that weakens it`,
        ).toBe(true);
      }
    }
  });

  it("names the asset and indication as illustrative", () => {
    expect(asset.name.toLowerCase()).toContain("illustrative");
    expect(asset.indication.toLowerCase()).toContain("illustrative");
  });
});
