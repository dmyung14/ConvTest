import type { ReactNode } from "react";
import Link from "next/link";

export { Drawer } from "./Drawer";

/** Small class-name joiner; keeps conditional Tailwind readable without a dependency. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ Badge */

export function Badge({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap",
        className ?? "bg-surface-muted text-ink-muted border-line-strong",
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------- Card */

export function Card({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "aside";
}) {
  return (
    <Tag
      className={cx(
        "rounded-lg border border-line bg-surface shadow-[0_1px_2px_rgba(20,24,29,0.04)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  description,
  action,
  id,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
      <div className="min-w-0">
        <h2 id={id} className="text-sm font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {description ? <p className="mt-0.5 text-xs text-ink-subtle">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ----------------------------------------------------------------- Button */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white border-accent hover:bg-accent-ink",
  secondary: "bg-surface text-ink border-line-strong hover:bg-surface-muted",
  ghost: "bg-transparent text-ink-muted border-transparent hover:bg-surface-muted",
  danger: "bg-surface text-danger border-danger/40 hover:bg-danger-soft",
};

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  children,
  variant = "secondary",
  className,
  type = "button",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button type={type} className={cx(BUTTON_BASE, BUTTON_VARIANTS[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "secondary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <Link href={href} className={cx(BUTTON_BASE, BUTTON_VARIANTS[variant], className)}>
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------ Empty state */

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      {icon ? <div className="text-ink-subtle">{icon}</div> : null}
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="max-w-sm text-xs leading-relaxed text-ink-subtle">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------ Definition */

export function DefinitionItem({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-subtle">{term}</dt>
      <dd className="mt-0.5 text-sm text-ink">{children}</dd>
    </div>
  );
}

/* --------------------------------------------------------------- Meters */

/**
 * Horizontal meter. The numeric value is always rendered as text next to it —
 * the bar is decoration for a number the reader can already read.
 */
export function Meter({
  value,
  label,
  tone = "accent",
}: {
  value: number;
  label: string;
  tone?: "accent" | "amber" | "slate";
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const toneClass = tone === "amber" ? "bg-amber" : tone === "slate" ? "bg-slate" : "bg-accent";
  return (
    <div
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted ring-1 ring-inset ring-line"
    >
      <div className={cx("h-full rounded-full", toneClass)} style={{ width: `${clamped}%` }} />
    </div>
  );
}
