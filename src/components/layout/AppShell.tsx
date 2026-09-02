import Link from "next/link";
import type { ReactNode } from "react";
import { Activity } from "lucide-react";

/** Fixed disclaimer text, used in the header, footer and print memo. */
export const PROTOTYPE_DISCLAIMER = "Independent prototype prepared for a Convexia conversation.";
export const ILLUSTRATIVE_DISCLAIMER =
  "The demonstration asset and all of its evidence are illustrative and synthetic. Nothing here is a real drug, study, trial or publication.";

export function Wordmark({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const ink = tone === "light" ? "text-chrome-ink" : "text-ink";
  const accent = tone === "light" ? "text-accent-soft" : "text-accent";
  return (
    <span className={`inline-flex items-center gap-2 ${ink}`}>
      <Activity aria-hidden className={`h-4 w-4 ${accent}`} strokeWidth={2.25} />
      <span className="text-[15px] font-semibold tracking-tight">
        Decision<span className={accent}>Trace</span>
      </span>
    </span>
  );
}

export function AppHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="dt-no-print sticky top-0 z-30 border-b border-chrome-soft bg-chrome text-chrome-ink">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <Link href="/" className="shrink-0 rounded-sm">
          <Wordmark tone="light" />
        </Link>
        <p className="hidden min-w-0 border-l border-chrome-soft pl-4 text-[11px] leading-tight text-chrome-ink-muted lg:block">
          {PROTOTYPE_DISCLAIMER}
        </p>
        <div className="ml-auto flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="dt-no-print border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-1 px-4 py-4 text-[11px] leading-relaxed text-ink-subtle sm:px-6">
        <p>
          <strong className="font-semibold text-ink-muted">{PROTOTYPE_DISCLAIMER}</strong> Not
          affiliated with, endorsed by, or built from any non-public information about Convexia.
        </p>
        <p>{ILLUSTRATIVE_DISCLAIMER}</p>
        <p>
          DecisionTrace does not predict whether a drug will work and does not provide medical,
          regulatory or investment advice.
        </p>
      </div>
    </footer>
  );
}

/** Skip link target id shared by the shell and its pages. */
export const MAIN_CONTENT_ID = "main-content";

export function SkipLink() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="dt-no-print sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-ink focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}
