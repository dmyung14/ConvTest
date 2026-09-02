import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EvidenceDrawer } from "@/components/workspace/EvidenceDrawer";
import { getDemoAsset } from "@/data";
import type { Claim } from "@/domain/schema";

const asset = getDemoAsset();
const claimById = (id: string): Claim => {
  const claim = asset.claims.find((item) => item.id === id);
  if (!claim) throw new Error(`fixture is missing claim ${id}`);
  return claim;
};

function renderDrawer(claim: Claim | null, onClose = vi.fn()) {
  return { onClose, ...render(<EvidenceDrawer asset={asset} claim={claim} onClose={onClose} />) };
}

describe("EvidenceDrawer", () => {
  it("renders nothing when no claim is selected", () => {
    renderDrawer(null);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("is a labelled modal dialog naming the selected claim", () => {
    const claim = claimById("clm-bio-01");
    renderDrawer(claim);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(within(dialog).getByRole("heading", { level: 2, name: claim.text })).toBeInTheDocument();
  });

  it("shows classification, confidence and review state as text, not colour alone", () => {
    renderDrawer(claimById("clm-pre-01"));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getAllByText("Contradiction").length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText("Low confidence").length).toBeGreaterThan(0);
    expect(within(dialog).getByText("Unreviewed")).toBeInTheDocument();
  });

  it("explains the classification before any source is read", () => {
    renderDrawer(claimById("clm-bio-02"));
    expect(
      screen.getByText(/No source states this\. A model reasoned from adjacent evidence/),
    ).toBeInTheDocument();
  });

  it("surfaces the confidence rationale rather than only a level", () => {
    const claim = claimById("clm-bio-02");
    renderDrawer(claim);
    expect(screen.getByText(claim.confidenceRationale)).toBeInTheDocument();
  });

  it("separates conflicting evidence from supporting evidence", () => {
    const claim = claimById("clm-saf-02");
    renderDrawer(claim);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/Conflicting evidence \(1\)/)).toBeInTheDocument();
    expect(within(dialog).getByText(/Supporting evidence \(1\)/)).toBeInTheDocument();
  });

  it("orders conflicting evidence above supporting evidence in the DOM", () => {
    renderDrawer(claimById("clm-pre-01"));
    const dialog = screen.getByRole("dialog");
    const conflicting = within(dialog).getByText(/Conflicting evidence/);
    const supporting = within(dialog).getByText(/Supporting evidence/);
    // Node.compareDocumentPosition: 4 means `supporting` follows `conflicting`.
    expect(conflicting.compareDocumentPosition(supporting) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("marks every illustrative record so it cannot be mistaken for a citation", () => {
    const claim = claimById("clm-bio-01");
    renderDrawer(claim);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getAllByText(/Illustrative record — not a real citation/)).toHaveLength(
      claim.evidence.length,
    );
  });

  it("offers no external link for illustrative evidence", () => {
    renderDrawer(claimById("clm-bio-01"));
    expect(within(screen.getByRole("dialog")).queryByRole("link")).not.toBeInTheDocument();
  });

  it("links a verified, retrieved source and marks it verified", () => {
    const verifiedClaim: Claim = {
      ...claimById("clm-bio-01"),
      evidence: [
        {
          id: "ev-verified",
          title: "Retrieved public record",
          sourceType: "Registry record",
          publisher: "Public registry",
          publishedAt: "2026-01-15",
          url: "https://example.org/record",
          summary: "A record that an adapter actually retrieved and validated.",
          relationship: "supports",
          isIllustrative: false,
          retrievedAt: "2026-09-01T10:00:00Z",
        },
      ],
    };
    renderDrawer(verifiedClaim);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Verified source")).toBeInTheDocument();
    const link = within(dialog).getByRole("link", { name: /Open source/ });
    expect(link).toHaveAttribute("href", "https://example.org/record");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("states a missing-evidence gap instead of showing an empty list", () => {
    renderDrawer(claimById("clm-clin-01"));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("No evidence records")).toBeInTheDocument();
    expect(
      within(dialog).getByText(/no inference has been substituted for it/),
    ).toBeInTheDocument();
    expect(within(dialog).queryByText(/Supporting evidence/)).not.toBeInTheDocument();
  });

  it("lists the decision-critical unknowns a claim feeds into", () => {
    renderDrawer(claimById("clm-pre-01"));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/Linked decision-critical unknowns \(1\)/)).toBeInTheDocument();
    expect(within(dialog).getByText(/Requires: Gene therapy scientist/)).toBeInTheDocument();
  });

  it("shows the claim's review history and says so plainly when there is none", () => {
    renderDrawer(claimById("clm-pre-01"));
    expect(screen.getByText(/Review history \(1\)/)).toBeInTheDocument();
    expect(
      screen.getByText(/Flagged durability contradiction for assay reconciliation/),
    ).toBeInTheDocument();
  });

  it("reports an empty review history for an untouched claim", () => {
    renderDrawer(claimById("clm-ops-01"));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/Review history \(0\)/)).toBeInTheDocument();
    expect(within(dialog).getByText(/No human has acted on this claim yet/)).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDrawer(claimById("clm-bio-01"));
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("closes from the close button", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDrawer(claimById("clm-bio-01"));
    await user.click(screen.getByRole("button", { name: "Close evidence drawer" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("moves focus into the panel when it opens", () => {
    renderDrawer(claimById("clm-bio-01"));
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
  });
});
