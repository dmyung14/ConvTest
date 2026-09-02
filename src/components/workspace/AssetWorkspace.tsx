"use client";

import { useMemo, useState } from "react";
import type { Asset, Claim } from "@/domain/schema";
import { useWorkspaceState } from "@/state/workspace-store";
import { Card, CardHeader } from "@/components/ui";
import { IllustrativeBanner } from "@/components/layout/IllustrativeBanner";
import { AssetHeader } from "./AssetHeader";
import { DecisionSummary } from "./DecisionSummary";
import {
  ClaimFilterBar,
  ClaimMatrix,
  DomainNav,
  EMPTY_FILTERS,
  applyClaimFilters,
  type ClaimFilters,
} from "./ClaimMatrix";

export function AssetWorkspace({ baseAsset }: { baseAsset: Asset }) {
  const { asset, summary } = useWorkspaceState(baseAsset);
  const [filters, setFilters] = useState<ClaimFilters>(EMPTY_FILTERS);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const visibleClaims = useMemo(
    () => applyClaimFilters(asset.claims, filters),
    [asset.claims, filters],
  );

  const selectClaim = (claim: Claim) => {
    setSelectedClaimId((current) => (current === claim.id ? null : claim.id));
  };

  return (
    <>
      <AssetHeader asset={asset} />

      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
        <IllustrativeBanner className="dt-no-print mb-5" />

        <DecisionSummary asset={asset} summary={summary} />

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
            description="Each row is one atomic, individually checkable claim. Select a claim to inspect its evidence."
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
      </div>
    </>
  );
}
