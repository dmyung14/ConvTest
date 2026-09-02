import { describe, expect, it } from "vitest";
import {
  COVERAGE_WEIGHTS,
  calculateCoveragePercent,
  calculateReviewedPercent,
  countByClassification,
  countByDomain,
  countByReviewStatus,
  countEvidenceItems,
  rankUnknowns,
  summarizeAsset,
} from "@/domain/coverage";
import type { Claim, EvidenceClassification, ReviewStatus } from "@/domain/schema";
import { getDemoAsset } from "@/data";

function claim(classification: EvidenceClassification): Pick<Claim, "classification"> {
  return { classification };
}

describe("coverage weights", () => {
  it("assigns the documented weight to each classification", () => {
    expect(COVERAGE_WEIGHTS).toEqual({
      direct_support: 1,
      model_inference: 0.5,
      contradiction: 0.25,
      missing_evidence: 0,
    });
  });
});

describe("calculateCoveragePercent", () => {
  it("returns 0 for an empty claim set rather than NaN", () => {
    expect(calculateCoveragePercent([])).toBe(0);
  });

  it("returns 100 when every claim is directly sourced", () => {
    expect(calculateCoveragePercent([claim("direct_support"), claim("direct_support")])).toBe(100);
  });

  it("returns 0 when every claim is missing evidence", () => {
    expect(calculateCoveragePercent([claim("missing_evidence"), claim("missing_evidence")])).toBe(
      0,
    );
  });

  it("applies the documented partial weights", () => {
    // (1 + 0.5 + 0.25 + 0) / 4 = 0.4375 -> 44
    expect(
      calculateCoveragePercent([
        claim("direct_support"),
        claim("model_inference"),
        claim("contradiction"),
        claim("missing_evidence"),
      ]),
    ).toBe(44);
  });

  it("rounds the final percentage half-up", () => {
    // (1 + 0.5 + 0.5) / 4 = 0.5 -> 50 ; (0.5 + 0.25) / 2 = 0.375 -> 38
    expect(
      calculateCoveragePercent([
        claim("direct_support"),
        claim("model_inference"),
        claim("model_inference"),
        claim("missing_evidence"),
      ]),
    ).toBe(50);
    expect(calculateCoveragePercent([claim("model_inference"), claim("contradiction")])).toBe(38);
  });

  it("never exceeds 100 or drops below 0", () => {
    const many = Array.from({ length: 50 }, () => claim("direct_support"));
    expect(calculateCoveragePercent(many)).toBe(100);
  });
});

describe("calculateReviewedPercent", () => {
  const withStatus = (reviewStatus: ReviewStatus) => ({ reviewStatus });

  it("counts every non-unreviewed status as reviewed", () => {
    expect(
      calculateReviewedPercent([
        withStatus("unreviewed"),
        withStatus("verified"),
        withStatus("needs_specialist"),
        withStatus("rejected"),
      ]),
    ).toBe(75);
  });

  it("returns 0 for an empty claim set", () => {
    expect(calculateReviewedPercent([])).toBe(0);
  });
});

describe("counters", () => {
  it("counts classifications with every key present", () => {
    expect(countByClassification([claim("direct_support"), claim("contradiction")])).toEqual({
      direct_support: 1,
      model_inference: 0,
      contradiction: 1,
      missing_evidence: 0,
    });
  });

  it("counts review statuses with every key present", () => {
    expect(countByReviewStatus([{ reviewStatus: "verified" }])).toEqual({
      unreviewed: 0,
      verified: 1,
      needs_specialist: 0,
      rejected: 0,
      superseded: 0,
    });
  });

  it("counts domains with every key present", () => {
    expect(countByDomain([{ domain: "safety_tolerability" }])).toEqual({
      biological_rationale: 0,
      translational_preclinical: 0,
      clinical_evidence: 0,
      safety_tolerability: 1,
      development_operational: 0,
    });
  });

  it("sums evidence items across claims", () => {
    expect(
      countEvidenceItems([
        { evidence: [{}, {}] as never[] },
        { evidence: [] as never[] },
        { evidence: [{}] as never[] },
      ]),
    ).toBe(3);
  });
});

describe("rankUnknowns", () => {
  it("orders high impact first and is stable within a level", () => {
    const ranked = rankUnknowns([
      { id: "a", impact: "medium" as const },
      { id: "b", impact: "low" as const },
      { id: "c", impact: "high" as const },
      { id: "d", impact: "medium" as const },
    ]);
    expect(ranked.map((u) => u.id)).toEqual(["c", "a", "d", "b"]);
  });

  it("does not mutate the input array", () => {
    const input = [{ impact: "low" as const }, { impact: "high" as const }];
    rankUnknowns(input);
    expect(input[0].impact).toBe("low");
  });
});

describe("summarizeAsset against the demo fixture", () => {
  const asset = getDemoAsset();
  const summary = summarizeAsset(asset);

  it("derives coverage that matches the value stated on the recommendation", () => {
    expect(summary.coveragePercent).toBe(asset.recommendation.coveragePercent);
  });

  it("reports counts that add up to the claim count", () => {
    const classificationTotal = Object.values(summary.classification).reduce((a, b) => a + b, 0);
    const reviewTotal = Object.values(summary.reviewStatus).reduce((a, b) => a + b, 0);
    const domainTotal = Object.values(summary.domain).reduce((a, b) => a + b, 0);
    expect(classificationTotal).toBe(summary.claimCount);
    expect(reviewTotal).toBe(summary.claimCount);
    expect(domainTotal).toBe(summary.claimCount);
  });

  it("starts the demonstration with nothing reviewed", () => {
    expect(summary.reviewedPercent).toBe(0);
    expect(summary.reviewStatus.unreviewed).toBe(summary.claimCount);
  });
});
