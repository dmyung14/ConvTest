import { FlaskConical } from "lucide-react";
import type { Asset } from "@/domain/schema";
import { formatTimestamp } from "@/domain/labels";
import { Badge, DefinitionItem } from "@/components/ui";

export function AssetHeader({ asset, action }: { asset: Asset; action?: React.ReactNode }) {
  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                {asset.name}
              </h1>
              {asset.isIllustrative ? (
                <Badge
                  className="border-amber/30 bg-amber-soft text-amber"
                  title="Synthetic demonstration asset. Not a real drug."
                >
                  <FlaskConical aria-hidden className="h-3 w-3" />
                  Illustrative asset
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-ink-muted">{asset.indication}</p>
          </div>
          <div className="dt-no-print shrink-0">{action}</div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
          <DefinitionItem term="Modality">{asset.modality}</DefinitionItem>
          <DefinitionItem term="Development stage">{asset.developmentStage}</DefinitionItem>
          <DefinitionItem term="Owner / status">{asset.ownerStatus}</DefinitionItem>
          <DefinitionItem term="Last evidence refresh">
            <span className="tabular-nums">{formatTimestamp(asset.updatedAt)} UTC</span>
          </DefinitionItem>
        </dl>
      </div>
    </div>
  );
}
