import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DEMO_ASSET_ID, getDemoAsset } from "@/data";
import { AppFooter, AppHeader, MAIN_CONTENT_ID, SkipLink } from "@/components/layout/AppShell";
import { AssetWorkspace } from "@/components/workspace/AssetWorkspace";

export function generateStaticParams() {
  return [{ assetId: DEMO_ASSET_ID }];
}

export const metadata: Metadata = {
  title: "Decision workspace",
};

export default async function AssetPage({ params }: PageProps<"/assets/[assetId]">) {
  const { assetId } = await params;
  if (assetId !== DEMO_ASSET_ID) notFound();

  const asset = getDemoAsset();

  return (
    <>
      <SkipLink />
      <AppHeader />
      <main id={MAIN_CONTENT_ID} className="flex-1">
        <AssetWorkspace baseAsset={asset} />
      </main>
      <AppFooter />
    </>
  );
}
