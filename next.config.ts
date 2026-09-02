import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js dev-mode indicator. It only ever renders in `next dev`,
  // never in a production build, but it sits over the workspace during a live
  // demo. Compile and runtime errors are still surfaced.
  devIndicators: false,
};

export default nextConfig;
