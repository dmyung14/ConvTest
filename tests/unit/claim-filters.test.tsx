import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ClaimFilterBar,
  ClaimMatrix,
  EMPTY_FILTERS,
  activeFilterCount,
  applyClaimFilters,
  type ClaimFilters,
} from "@/components/workspace/ClaimMatrix";
import { summarizeAsset } from "@/domain/coverage";
import { getDemoAsset } from "@/data";

const asset = getDemoAsset();
const summary = summarizeAsset(asset);

describe("applyClaimFilters", () => {
  it("returns every claim when no filter is set", () => {
    expect(applyClaimFilters(asset.claims, EMPTY_FILTERS)).toHaveLength(asset.claims.length);
  });

  it("filters by domain", () => {
    const result = applyClaimFilters(asset.claims, {
      ...EMPTY_FILTERS,
      domain: "safety_tolerability",
    });
    expect(result).toHaveLength(summary.domain.safety_tolerability);
    expect(result.every((claim) => claim.domain === "safety_tolerability")).toBe(true);
  });

  it("filters by classification", () => {
    const result = applyClaimFilters(asset.claims, {
      ...EMPTY_FILTERS,
      classification: "contradiction",
    });
    expect(result).toHaveLength(summary.classification.contradiction);
    expect(result.every((claim) => claim.classification === "contradiction")).toBe(true);
  });

  it("filters by review status", () => {
    const result = applyClaimFilters(asset.claims, { ...EMPTY_FILTERS, reviewStatus: "verified" });
    expect(result).toHaveLength(0);
  });

  it("combines filters conjunctively", () => {
    const result = applyClaimFilters(asset.claims, {
      domain: "translational_preclinical",
      classification: "contradiction",
      reviewStatus: "unreviewed",
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("clm-pre-01");
  });

  it("reaches every claim through some domain filter — none are unreachable", () => {
    const seen = new Set<string>();
    for (const domain of Object.keys(summary.domain) as (keyof typeof summary.domain)[]) {
      for (const claim of applyClaimFilters(asset.claims, { ...EMPTY_FILTERS, domain })) {
        seen.add(claim.id);
      }
    }
    expect(seen.size).toBe(asset.claims.length);
  });

  it("counts only non-default filters as active", () => {
    expect(activeFilterCount(EMPTY_FILTERS)).toBe(0);
    expect(activeFilterCount({ ...EMPTY_FILTERS, domain: "clinical_evidence" })).toBe(1);
    expect(
      activeFilterCount({
        domain: "clinical_evidence",
        classification: "missing_evidence",
        reviewStatus: "unreviewed",
      }),
    ).toBe(3);
  });
});

describe("ClaimFilterBar", () => {
  it("reports the visible and total claim counts", () => {
    render(
      <ClaimFilterBar
        filters={EMPTY_FILTERS}
        summary={summary}
        resultCount={2}
        onChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getByText(/Showing/)).toHaveTextContent(`Showing 2 of ${summary.claimCount}`);
  });

  it("emits the selected classification", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ClaimFilterBar
        filters={EMPTY_FILTERS}
        summary={summary}
        resultCount={summary.claimCount}
        onChange={onChange}
        onReset={vi.fn()}
      />,
    );
    await user.selectOptions(
      screen.getByLabelText("Filter by evidence classification"),
      "contradiction",
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ classification: "contradiction" } satisfies Partial<ClaimFilters>),
    );
  });

  it("offers a clear action only when a filter is active", async () => {
    const onReset = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <ClaimFilterBar
        filters={EMPTY_FILTERS}
        summary={summary}
        resultCount={summary.claimCount}
        onChange={vi.fn()}
        onReset={onReset}
      />,
    );
    expect(screen.queryByRole("button", { name: /Clear/ })).not.toBeInTheDocument();

    rerender(
      <ClaimFilterBar
        filters={{ ...EMPTY_FILTERS, classification: "contradiction" }}
        summary={summary}
        resultCount={2}
        onChange={vi.fn()}
        onReset={onReset}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Clear 1 filter/ }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});

describe("ClaimMatrix", () => {
  it("renders one row per claim and selects on click", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    const claims = applyClaimFilters(asset.claims, {
      ...EMPTY_FILTERS,
      classification: "contradiction",
    });
    render(
      <ClaimMatrix
        claims={claims}
        selectedClaimId={null}
        onSelect={onSelect}
        onResetFilters={vi.fn()}
      />,
    );

    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(claims.length + 1); // + header

    await user.click(within(table).getByRole("button", { name: claims[0].text }));
    expect(onSelect).toHaveBeenCalledWith(claims[0]);
  });

  it("shows an em dash rather than a zero for claims with no evidence records", () => {
    const claims = applyClaimFilters(asset.claims, {
      ...EMPTY_FILTERS,
      classification: "missing_evidence",
    });
    render(
      <ClaimMatrix
        claims={claims}
        selectedClaimId={null}
        onSelect={vi.fn()}
        onResetFilters={vi.fn()}
      />,
    );
    const table = screen.getByRole("table");
    expect(within(table).queryByText("0")).not.toBeInTheDocument();
    expect(within(table).getAllByTitle("No evidence records address this claim").length).toBe(
      claims.length,
    );
  });

  it("explains an empty result set instead of rendering nothing", async () => {
    const onResetFilters = vi.fn();
    const user = userEvent.setup();
    render(
      <ClaimMatrix
        claims={[]}
        selectedClaimId={null}
        onSelect={vi.fn()}
        onResetFilters={onResetFilters}
      />,
    );
    expect(screen.getByText("No claims match these filters")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onResetFilters).toHaveBeenCalledOnce();
  });
});
