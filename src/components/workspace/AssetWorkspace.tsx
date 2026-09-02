"use client";

import { useMemo, useState } from "react";
import { Printer, RotateCcw } from "lucide-react";
import type { Asset, Claim } from "@/domain/schema";
import { useWorkspaceState } from "@/state/workspace-store";
import { Button, Card, CardHeader } from "@/components/ui";
import { IllustrativeBanner } from "@/components/layout/IllustrativeBanner";
import { AssetHeader } from "./AssetHeader";
import { AuditTrail } from "./AuditTrail";
import { DecisionSummary } from "./DecisionSummary";
import { EvidenceDrawer } from "./EvidenceDrawer";
import { ReviewControls } from "./ReviewControls";
import { ReviewProgress } from "./ReviewProgress";
import {
  ClaimFilterBar,
  ClaimMatrix,
  DomainNav,
  EMPTY_FILTERS,
  applyClaimFilters,
  type ClaimFilters,
} from "./ClaimMatrix";

export function AssetWorkspace({ baseAsset }: { baseAsset: Asset }) {
  const { asset, summary, reviewClaim, resetDemo, reviewerEventCount } =
    useWorkspaceState(baseAsset);
  const [filters, setFilters] = useState<ClaimFilters>(EMPTY_FILTERS);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const visibleClaims = useMemo(
    () => applyClaimFilters(asset.claims, filters),
    [asset.claims, filters],
  );

  const selectedClaim = useMemo(
    () => asset.claims.find((claim) => claim.id === selectedClaimId) ?? null,
    [asset.claims, selectedClaimId],
  );

  const selectClaim = (claim: Claim) => {
    setSelectedClaimId(claim.id);
  };

  return (
    <>
      <AssetHeader
        asset={asset}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => window.print()}
              title="Opens the browser print dialog for the decision memo"
            >
              <Printer aria-hidden className="h-4 w-4" />
              Decision memo
            </Button>
            <Button
              variant="ghost"
              onClick={resetDemo}
              disabled={reviewerEventCount === 0}
              title={
                reviewerEventCount === 0
                  ? "Nothing to reset — the demo is in its starting state"
                  : `Discard ${reviewerEventCount} review action${reviewerEventCount > 1 ? "s" : ""} and restore the starting state`
              }
            >
              <RotateCcw aria-hidden className="h-4 w-4" />
              Reset demo
            </Button>
          </div>
        }
      />

      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
        <IllustrativeBanner className="dt-no-print mb-5" />

        <DecisionSummary asset={asset} summary={summary} />

        <div className="mt-4">
          <ReviewProgress summary={summary} />
        </div>

        <div className="mt-6">
          <DomainNav
            summary={summary}
            value={filters.domain}
            onChange={(domain) => setFilters((current) => ({ ...current, domain }))}
          />
        </div>

        <Card className="mt-3 overflow-hidden">
          <CardHeader
            title="Claim matrix"
            description="Each row is one atomic, individually checkable claim. Select a claim to inspect its evidence and record a review."
          />
          <ClaimFilterBar
            filters={filters}
            summary={summary}
            resultCount={visibleClaims.length}
            onChange={setFilters}
            onReset={() => setFilters(EMPTY_FILTERS)}
          />
          <ClaimMatrix
            claims={visibleClaims}
            selectedClaimId={selectedClaimId}
            onSelect={selectClaim}
            onResetFilters={() => setFilters(EMPTY_FILTERS)}
          />
        </Card>

        <div className="mt-6">
          <AuditTrail asset={asset} claimLookup />
        </div>
      </div>

      <EvidenceDrawer
        asset={asset}
        claim={selectedClaim}
        onClose={() => setSelectedClaimId(null)}
        footer={
          selectedClaim ? <ReviewControls claim={selectedClaim} onReview={reviewClaim} /> : null
        }
      />
    </>
  );
}
