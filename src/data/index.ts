import { parseAsset } from "@/domain/schema";
import type { Asset } from "@/domain/schema";
import { demoAsset } from "./demo-asset";

/**
 * Single entry point for demonstration data.
 *
 * The fixture is validated on read, so a malformed edit fails loudly at the
 * boundary instead of rendering a half-broken workspace.
 */
export function getDemoAsset(): Asset {
  return parseAsset(demoAsset);
}

export const DEMO_ASSET_ID = demoAsset.id;
