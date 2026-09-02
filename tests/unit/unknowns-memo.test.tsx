import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UnknownsPanel } from "@/components/workspace/UnknownsPanel";
import { DecisionMemo } from "@/components/workspace/DecisionMemo";
import { summarizeAsset } from "@/domain/coverage";
import { getDemoAsset } from "@/data";

const asset = getDemoAsset();
const summary = summarizeAsset(asset);

describe("UnknownsPanel", () => {
  it("ranks unknowns by impact, highest first", () => {
    render(<UnknownsPanel asset={asset} />);
    const items = screen.getAllByRole("listitem");
    const impacts = items.map(
      (item) => within(item).getByText(/(High|Medium|Low) impact/).textContent,
    );
    expect(impacts.slice(0, 3)).toEqual(["High impact", "High impact", "High impact"]);
    expect(impacts.slice(3)).toEqual(["Medium impact", "Medium impact"]);
  });

  it("surfaces the three highest-impact unknowns without navigation", () => {
    render(<UnknownsPanel asset={asset} />);
    expect(screen.getByText("3 high impact")).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(
      within(items[0]).getByText(/Does transgene expression persist beyond 9 months/),
    ).toBeInTheDocument();
  });

  it("explains why each unknown could change the decision", () => {
    render(<UnknownsPanel asset={asset} />);
    expect(screen.getAllByText(/Why it could change the decision:/)).toHaveLength(
      asset.unknowns.length,
    );
    for (const unknown of asset.unknowns) {
      expect(screen.getByText(unknown.rationale)).toBeInTheDocument();
    }
  });

  it("names the specialist each unknown should be routed to", () => {
    render(<UnknownsPanel asset={asset} />);
    expect(screen.getAllByText("Route to:")).toHaveLength(asset.unknowns.length);
    expect(screen.getByText(/Immunologist/)).toBeInTheDocument();
    expect(screen.getByText(/Gene therapy scientist/)).toBeInTheDocument();
  });

  it("navigates to an affected claim", async () => {
    const onSelectClaim = vi.fn();
    const user = userEvent.setup();
    render(<UnknownsPanel asset={asset} onSelectClaim={onSelectClaim} />);
    const target = asset.claims.find((claim) => claim.id === "clm-pre-01")!;
    await user.click(
      screen.getAllByRole("button", { name: new RegExp(target.text.slice(0, 30)) })[0],
    );
    expect(onSelectClaim).toHaveBeenCalledWith(target);
  });

  it("renders as static text when no navigation handler is supplied", () => {
    render(<UnknownsPanel asset={asset} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("DecisionMemo", () => {
  it("states the recommendation and its confidence explanation", () => {
    render(<DecisionMemo asset={asset} summary={summary} />);
    expect(screen.getByText(asset.recommendation.label)).toBeInTheDocument();
    expect(screen.getByText(asset.recommendation.confidenceExplanation)).toBeInTheDocument();
  });

  it("never presents a clinical prediction as validated truth", () => {
    const { container } = render(<DecisionMemo asset={asset} summary={summary} />);
    const text = container.textContent ?? "";
    expect(text).toContain("It is not a prediction that the asset will succeed");
    expect(text).toContain("no probability of technical or regulatory success is asserted");
    expect(text).toContain("It is not a probability of technical, clinical or regulatory success");
    expect(text).toContain("does not constitute medical, regulatory or investment advice");
  });

  it("documents the exact coverage formula and its weights", () => {
    const { container } = render(<DecisionMemo asset={asset} summary={summary} />);
    expect(container.textContent).toContain(
      "coveragePercent = round(100 × Σ weight(claim) / claimCount)",
    );
    expect(screen.getByText("1.00")).toBeInTheDocument();
    expect(screen.getByText("0.50")).toBeInTheDocument();
    expect(screen.getByText("0.25")).toBeInTheDocument();
    expect(screen.getByText("0.00")).toBeInTheDocument();
  });

  it("carries the prototype and illustrative-data disclaimers", () => {
    const { container } = render(<DecisionMemo asset={asset} summary={summary} />);
    expect(
      screen.getByText("Independent prototype prepared for a Convexia conversation."),
    ).toBeInTheDocument();
    expect(container.textContent).toContain("illustrative and synthetic");
  });

  it("includes every claim with its classification, confidence and reviewer", () => {
    const { container } = render(<DecisionMemo asset={asset} summary={summary} />);
    for (const claim of asset.claims) {
      expect(screen.getByText(claim.text)).toBeInTheDocument();
    }
    expect((container.textContent?.match(/reviewer:/g) ?? []).length).toBe(asset.claims.length);
  });

  it("ranks the unknowns and names each required reviewer", () => {
    const { container } = render(<DecisionMemo asset={asset} summary={summary} />);
    const text = container.textContent ?? "";
    expect(text.indexOf("[HIGH IMPACT]")).toBeLessThan(text.indexOf("[MEDIUM IMPACT]"));
    for (const unknown of asset.unknowns) {
      expect(text).toContain(`Route to: ${unknown.requiredReviewer}`);
    }
  });

  it("reports human review actions, and says plainly when there are none", () => {
    const { container, rerender } = render(<DecisionMemo asset={asset} summary={summary} />);
    const humanCount = asset.auditEvents.filter((event) => event.actorType === "human").length;
    expect(container.textContent).toContain(`5. Human review actions (${humanCount})`);

    const noHuman = {
      ...asset,
      auditEvents: asset.auditEvents.filter((e) => e.actorType !== "human"),
    };
    rerender(<DecisionMemo asset={noHuman} summary={summary} />);
    expect(
      screen.getByText("No human review actions have been recorded against this asset."),
    ).toBeInTheDocument();
  });

  it("is hidden on screen and revealed only for print", () => {
    render(<DecisionMemo asset={asset} summary={summary} />);
    expect(screen.getByTestId("decision-memo").className).toContain("hidden");
    expect(screen.getByTestId("decision-memo").className).toContain("print:block");
  });
});
