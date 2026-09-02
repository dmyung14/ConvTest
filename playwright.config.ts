import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * Resolve a Chromium binary.
 *
 * Playwright normally downloads its own. In an offline or sandboxed environment
 * one is often already installed at a different build number, so fall back to
 * whatever is present rather than failing to launch. Returning `undefined`
 * leaves Playwright's default behaviour untouched.
 */
function resolveChromium(): string | undefined {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;

  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!root || !existsSync(root)) return undefined;

  const candidate = readdirSync(root)
    .filter((entry) => entry.startsWith("chromium-"))
    .map((entry) => path.join(root, entry, "chrome-linux", "chrome"))
    .find((binary) => existsSync(binary));

  return candidate;
}

const executablePath = resolveChromium();

/** Keep the browser from reaching for Google services the sandbox blocks. */
const OFFLINE_ARGS = [
  "--disable-background-networking",
  "--disable-component-update",
  "--disable-sync",
  "--no-first-run",
  "--no-default-browser-check",
];

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL,
    trace: "off",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // A pinned `channel` takes precedence over `executablePath`, so it is
        // cleared whenever an explicit binary is being used.
        ...(executablePath
          ? { channel: undefined, launchOptions: { executablePath, args: OFFLINE_ARGS } }
          : { launchOptions: { args: OFFLINE_ARGS } }),
      },
    },
  ],
  webServer: {
    // Build first so `npm run test:e2e` works from a clean checkout.
    command: `npm run build && npx next start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
