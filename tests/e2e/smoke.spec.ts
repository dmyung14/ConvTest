import { expect, test, type Page } from "@playwright/test";

/**
 * The demonstration path, exactly as it is presented:
 * landing → asset → filter to contradictions → open a claim → escalate it →
 * confirm the audit event → reset.
 */

const reviewProgress = (page: Page) =>
  page
    .locator("div", { has: page.getByRole("heading", { name: "Expert review progress" }) })
    .last();

test.beforeEach(async ({ page }) => {
  await page.goto("/assets/demo-asset");
  await page.evaluate(() => window.localStorage.clear());
});

test("landing page reaches the demonstration asset in one click", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "decision record an expert can challenge",
  );
  await expect(page.getByText("Independent prototype.").first()).toBeVisible();

  await page.getByRole("link", { name: /Open demonstration asset/ }).click();
  await expect(page).toHaveURL(/\/assets\/demo-asset$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("DTX-101 (illustrative)");
});

test("the workspace states its provisional recommendation and its uncertainty", async ({
  page,
}) => {
  await page.goto("/assets/demo-asset");

  await expect(page.getByText("Escalate to expert review").first()).toBeVisible();
  await expect(page.getByText("Illustrative evidence.")).toBeVisible();
  await expect(page.getByText("Evidence coverage", { exact: true })).toBeVisible();
  await expect(page.getByText("61%").first()).toBeVisible();
  await expect(page.getByRole("meter", { name: /Evidence coverage: 61 percent/ })).toBeVisible();

  // The three highest-impact unknowns are visible without deep navigation.
  await expect(page.getByText(/Three unknowns dominating this recommendation/)).toBeVisible();
  await expect(
    page.getByText(/Does transgene expression persist beyond 9 months/).first(),
  ).toBeVisible();
});

test("full review path: filter, inspect, escalate, audit, reset", async ({ page }) => {
  await page.goto("/assets/demo-asset");

  const resetButton = page.getByRole("button", { name: "Reset demo" });
  await expect(resetButton).toBeDisabled();

  const auditCount = page.getByText(/^\d+ events$/);
  await expect(auditCount).toHaveText("7 events");

  // 1. Filter to contradictory claims.
  await page.getByLabel("Filter by evidence classification").selectOption("contradiction");
  await expect(page.getByText(/Showing/)).toContainText("Showing 2 of 14 claims");

  // 2. Open one claim.
  await page
    .getByRole("button", { name: /A single systemic dose/ })
    .first()
    .click();
  const drawer = page.getByRole("dialog");
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveAttribute("aria-modal", "true");

  // Sourced, inferred and conflicting evidence are visibly different.
  await expect(drawer.getByText(/Conflicting evidence \(1\)/)).toBeVisible();
  await expect(drawer.getByText(/Supporting evidence \(1\)/)).toBeVisible();
  await expect(drawer.getByText(/Illustrative record — not a real citation/).first()).toBeVisible();
  await expect(drawer.getByRole("link")).toHaveCount(0);

  // 3. Mark it for specialist review, with a rationale.
  await drawer.getByRole("button", { name: /Needs specialist/ }).click();
  await drawer
    .getByLabel(/Rationale/)
    .fill(
      "Reconcile immunostaining against transcript quantification before either durability result is treated as decisive.",
    );
  await drawer.getByRole("button", { name: /Record needs specialist/ }).click();

  await expect(drawer.getByText(/Review history \(2\)/i)).toBeVisible();
  await drawer.getByRole("button", { name: "Close evidence drawer" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // 4. Confirm the audit event and the updated counts.
  await expect(auditCount).toHaveText("8 events");
  await expect(page.getByText("Escalated claim for specialist review").first()).toBeVisible();
  await expect(reviewProgress(page)).toContainText("1/14");
  await expect(resetButton).toBeEnabled();

  // 5. Reset restores the deterministic starting state.
  await resetButton.click();
  await expect(auditCount).toHaveText("7 events");
  await expect(reviewProgress(page)).toContainText("0/14");
  await expect(resetButton).toBeDisabled();
});

test("a rejection is blocked until the reviewer explains it", async ({ page }) => {
  await page.goto("/assets/demo-asset");

  await page
    .getByRole("button", { name: /Restoring roughly 30%/ })
    .first()
    .click();
  const drawer = page.getByRole("dialog");
  await drawer.getByRole("button", { name: /^Rejected/ }).click();
  await drawer.getByRole("button", { name: /Record rejected/ }).click();

  await expect(drawer.getByRole("alert")).toContainText("overrides the evidence on record");
  await expect(drawer.getByLabel(/Rationale/)).toHaveAttribute("aria-invalid", "true");
});

test("the evidence drawer is keyboard accessible and closes with Escape", async ({ page }) => {
  await page.goto("/assets/demo-asset");

  const trigger = page.getByRole("button", { name: /Loss of function in the target gene/ }).first();
  await trigger.click();
  const drawer = page.getByRole("dialog");
  await expect(drawer).toBeVisible();

  // Focus is inside the panel.
  expect(
    await page.evaluate(() =>
      document.querySelector('[role="dialog"]')?.contains(document.activeElement),
    ),
  ).toBe(true);

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // Focus returns to the row that opened it.
  await expect(trigger).toBeFocused();
});

test("a missing-evidence claim states the gap instead of showing nothing", async ({ page }) => {
  await page.goto("/assets/demo-asset");

  await page.getByLabel("Filter by evidence classification").selectOption("missing_evidence");
  await expect(page.getByText(/Showing/)).toContainText("Showing 2 of 14 claims");

  await page
    .getByRole("button", { name: /administered to human subjects/ })
    .first()
    .click();
  const drawer = page.getByRole("dialog");
  await expect(drawer.getByText("No evidence records")).toBeVisible();
  await expect(drawer.getByText(/no inference has been substituted for it/)).toBeVisible();
});

test("decision-critical unknowns are ranked and routed to a named specialist", async ({ page }) => {
  await page.goto("/assets/demo-asset");

  const panel = page.locator("section", {
    has: page.getByRole("heading", { name: "Decision-critical unknowns" }),
  });
  await expect(panel.getByText("3 high impact")).toBeVisible();
  await expect(panel.getByText("Route to:")).toHaveCount(5);
  await expect(panel.getByText(/Why it could change the decision:/)).toHaveCount(5);

  // Navigating from an unknown opens the claim it would change.
  await panel
    .getByRole("button", { name: /A single systemic dose/ })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("the print memo replaces the app and never claims a validated prediction", async ({
  page,
}) => {
  await page.goto("/assets/demo-asset");

  const memo = page.getByTestId("decision-memo");
  await expect(memo).toBeHidden();

  await page.emulateMedia({ media: "print" });
  await expect(memo).toBeVisible();
  // The claim matrix is suppressed; the memo's own table is what prints.
  await expect(page.locator("table").first()).toBeHidden();
  await expect(memo.locator("table")).toBeVisible();

  const text = (await memo.innerText()).toLowerCase();
  expect(text).toContain("not a prediction that the asset will succeed");
  expect(text).toContain("does not constitute medical, regulatory or investment advice");
  expect(text).toContain("illustrative and synthetic");
});

test("the methodology page explains coverage and its limits", async ({ page }) => {
  await page.goto("/methodology");

  await expect(page.getByRole("heading", { level: 1, name: "Methodology" })).toBeVisible();
  await expect(
    page.getByText("coveragePercent = round(100 × Σ weight(claim) / claimCount)"),
  ).toBeVisible();
  await expect(
    page.getByText(/It is not a probability of technical, clinical or regulatory success/),
  ).toBeVisible();

  await page.getByRole("link", { name: /Back to the demonstration asset/ }).click();
  await expect(page).toHaveURL(/\/assets\/demo-asset$/);
});

test("the source adapter is disabled by default and fails without breaking the app", async ({
  page,
  request,
}) => {
  const response = await request.get("/api/sources?term=neuromuscular");
  expect(response.status()).toBe(503);
  expect(await response.json()).toMatchObject({ ok: false, reason: "disabled" });

  await page.goto("/assets/demo-asset");
  await expect(page.getByText("Illustrative evidence.")).toBeVisible();
});
