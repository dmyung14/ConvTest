import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, renderHook, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewControls } from "@/components/workspace/ReviewControls";
import { AuditTrail } from "@/components/workspace/AuditTrail";
import {
  RATIONALE_REQUIRED,
  __resetStoreForTests,
  isRationaleRequired,
  useWorkspaceState,
} from "@/state/workspace-store";
import { getDemoAsset } from "@/data";
import type { Claim } from "@/domain/schema";

const baseAsset = getDemoAsset();
const claimById = (id: string): Claim => {
  const claim = baseAsset.claims.find((item) => item.id === id);
  if (!claim) throw new Error(`fixture is missing claim ${id}`);
  return claim;
};

beforeEach(() => {
  window.localStorage.clear();
  __resetStoreForTests();
});

describe("rationale policy", () => {
  it("requires a rationale only for actions that override the evidence", () => {
    expect(RATIONALE_REQUIRED).toEqual(["rejected", "superseded"]);
    expect(isRationaleRequired("rejected")).toBe(true);
    expect(isRationaleRequired("superseded")).toBe(true);
    expect(isRationaleRequired("verified")).toBe(false);
    expect(isRationaleRequired("needs_specialist")).toBe(false);
    expect(isRationaleRequired("unreviewed")).toBe(false);
  });
});

describe("useWorkspaceState", () => {
  it("starts from the pristine fixture", () => {
    const { result } = renderHook(() => useWorkspaceState(baseAsset));
    expect(result.current.summary.reviewStatus.unreviewed).toBe(baseAsset.claims.length);
    expect(result.current.asset.auditEvents).toHaveLength(baseAsset.auditEvents.length);
    expect(result.current.reviewerEventCount).toBe(0);
  });

  it("records a review, updates the claim and appends one audit event", () => {
    const { result } = renderHook(() => useWorkspaceState(baseAsset));
    act(() =>
      result.current.reviewClaim("clm-pre-01", "needs_specialist", "Reconcile the assays."),
    );

    const claim = result.current.asset.claims.find((item) => item.id === "clm-pre-01");
    expect(claim?.reviewStatus).toBe("needs_specialist");
    expect(claim?.lastReviewedAt).toBeTruthy();

    expect(result.current.asset.auditEvents).toHaveLength(baseAsset.auditEvents.length + 1);
    const event = result.current.asset.auditEvents.at(-1);
    expect(event).toMatchObject({
      actorType: "human",
      action: "Escalated claim for specialist review",
      rationale: "Reconcile the assays.",
      claimId: "clm-pre-01",
    });
    expect(Date.parse(event!.timestamp)).not.toBeNaN();
  });

  it("never mutates the source fixture", () => {
    const { result } = renderHook(() => useWorkspaceState(baseAsset));
    act(() => result.current.reviewClaim("clm-pre-01", "rejected", "Not supported."));
    expect(claimById("clm-pre-01").reviewStatus).toBe("unreviewed");
    expect(baseAsset.auditEvents).toHaveLength(7);
  });

  it("records the absence of a rationale rather than inventing one", () => {
    const { result } = renderHook(() => useWorkspaceState(baseAsset));
    act(() => result.current.reviewClaim("clm-bio-01", "verified", "   "));
    expect(result.current.asset.auditEvents.at(-1)?.rationale).toMatch(/No rationale recorded/);
  });

  it("updates review counts and leaves evidence coverage untouched", () => {
    const { result } = renderHook(() => useWorkspaceState(baseAsset));
    const coverageBefore = result.current.summary.coveragePercent;
    act(() => result.current.reviewClaim("clm-bio-01", "verified", "Checked both records."));
    expect(result.current.summary.reviewStatus.verified).toBe(1);
    expect(result.current.summary.reviewedPercent).toBe(
      Math.round((1 / baseAsset.claims.length) * 100),
    );
    expect(result.current.summary.coveragePercent).toBe(coverageBefore);
  });

  it("clears a claim back to unreviewed", () => {
    const { result } = renderHook(() => useWorkspaceState(baseAsset));
    act(() => result.current.reviewClaim("clm-bio-01", "verified", "Checked."));
    act(() => result.current.reviewClaim("clm-bio-01", "unreviewed", "Reverting."));
    const claim = result.current.asset.claims.find((item) => item.id === "clm-bio-01");
    expect(claim?.reviewStatus).toBe("unreviewed");
    // The clear is itself auditable: two human events, not zero.
    expect(result.current.reviewerEventCount).toBe(2);
  });

  it("ignores a review for a claim that does not exist", () => {
    const { result } = renderHook(() => useWorkspaceState(baseAsset));
    act(() => result.current.reviewClaim("no-such-claim", "verified", "…"));
    expect(result.current.reviewerEventCount).toBe(0);
  });

  it("persists to localStorage and restores on a fresh mount", () => {
    const first = renderHook(() => useWorkspaceState(baseAsset));
    act(() =>
      first.result.current.reviewClaim("clm-saf-02", "needs_specialist", "Harmonise assay."),
    );
    expect(window.localStorage.getItem("decisiontrace.review.v1")).toContain("clm-saf-02");

    __resetStoreForTests();
    const second = renderHook(() => useWorkspaceState(baseAsset));
    const claim = second.result.current.asset.claims.find((item) => item.id === "clm-saf-02");
    expect(claim?.reviewStatus).toBe("needs_specialist");
  });

  it("ignores stored state written for a different asset", () => {
    window.localStorage.setItem(
      "decisiontrace.review.v1",
      JSON.stringify({
        version: 1,
        assetId: "some-other-asset",
        reviews: { "clm-bio-01": { reviewStatus: "rejected", rationale: "x", timestamp: "t" } },
        events: [],
      }),
    );
    __resetStoreForTests();
    const { result } = renderHook(() => useWorkspaceState(baseAsset));
    expect(result.current.summary.reviewStatus.rejected).toBe(0);
  });

  it("falls back to the fixture when stored state is corrupt", () => {
    window.localStorage.setItem("decisiontrace.review.v1", "{not json");
    __resetStoreForTests();
    const { result } = renderHook(() => useWorkspaceState(baseAsset));
    expect(result.current.summary.reviewStatus.unreviewed).toBe(baseAsset.claims.length);
  });

  it("reset restores the deterministic starting state and clears storage", () => {
    const { result } = renderHook(() => useWorkspaceState(baseAsset));
    act(() => result.current.reviewClaim("clm-bio-01", "verified", "Checked."));
    act(() => result.current.reviewClaim("clm-pre-01", "rejected", "Assays disagree."));
    expect(result.current.reviewerEventCount).toBe(2);

    act(() => result.current.resetDemo());
    expect(result.current.reviewerEventCount).toBe(0);
    expect(result.current.summary.reviewStatus.unreviewed).toBe(baseAsset.claims.length);
    expect(result.current.asset.auditEvents).toHaveLength(baseAsset.auditEvents.length);
    expect(window.localStorage.getItem("decisiontrace.review.v1")).toBeNull();
  });
});

describe("ReviewControls", () => {
  it("offers all four review actions", () => {
    render(<ReviewControls claim={claimById("clm-bio-01")} onReview={vi.fn()} />);
    for (const name of [/Verified/, /Needs specialist/, /^Rejected/, /Superseded/]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("submits an escalation without demanding a rationale", async () => {
    const onReview = vi.fn();
    const user = userEvent.setup();
    render(<ReviewControls claim={claimById("clm-pre-01")} onReview={onReview} />);
    await user.click(screen.getByRole("button", { name: /Needs specialist/ }));
    expect(screen.getByText(/\(recommended\)/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Record needs specialist/ }));
    expect(onReview).toHaveBeenCalledWith("clm-pre-01", "needs_specialist", "");
  });

  it("blocks a rejection with no rationale and explains why", async () => {
    const onReview = vi.fn();
    const user = userEvent.setup();
    render(<ReviewControls claim={claimById("clm-bio-02")} onReview={onReview} />);
    await user.click(screen.getByRole("button", { name: /^Rejected/ }));
    expect(screen.getByText(/\(required — this overrides the evidence\)/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Record rejected/ }));

    expect(onReview).not.toHaveBeenCalled();
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/overrides the evidence on record/);
    expect(screen.getByLabelText(/Rationale/)).toHaveAttribute("aria-invalid", "true");
  });

  it("submits a rejection once a rationale is supplied", async () => {
    const onReview = vi.fn();
    const user = userEvent.setup();
    render(<ReviewControls claim={claimById("clm-bio-02")} onReview={onReview} />);
    await user.click(screen.getByRole("button", { name: /^Rejected/ }));
    await user.type(screen.getByLabelText(/Rationale/), "Threshold inferred from carriers only.");
    await user.click(screen.getByRole("button", { name: /Record rejected/ }));
    expect(onReview).toHaveBeenCalledWith(
      "clm-bio-02",
      "rejected",
      "Threshold inferred from carriers only.",
    );
  });

  it("offers a clear action only for a claim that has been reviewed", async () => {
    const onReview = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <ReviewControls claim={claimById("clm-bio-01")} onReview={onReview} />,
    );
    expect(screen.queryByRole("button", { name: "Clear review state" })).not.toBeInTheDocument();

    rerender(
      <ReviewControls
        claim={{ ...claimById("clm-bio-01"), reviewStatus: "verified" }}
        onReview={onReview}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Clear review state" }));
    expect(onReview).toHaveBeenCalledWith("clm-bio-01", "unreviewed", expect.any(String));
  });
});

describe("AuditTrail", () => {
  it("lists every event newest first with actor, action, rationale and time", () => {
    render(<AuditTrail asset={baseAsset} />);
    expect(screen.getByText(`${baseAsset.auditEvents.length} events`)).toBeInTheDocument();

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(baseAsset.auditEvents.length);

    const newest = baseAsset.auditEvents.at(-1)!;
    expect(within(items[0]).getByText(newest.action)).toBeInTheDocument();
    expect(within(items[0]).getByText(newest.actor)).toBeInTheDocument();
    expect(within(items[0]).getByText(newest.rationale)).toBeInTheDocument();
    expect(within(items[0]).getByText(/UTC$/)).toBeInTheDocument();
  });

  it("labels agent, system and human actors as text", () => {
    render(<AuditTrail asset={baseAsset} />);
    expect(screen.getAllByText("Agent").length).toBeGreaterThan(0);
    expect(screen.getAllByText("System").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Human").length).toBeGreaterThan(0);
  });
});
