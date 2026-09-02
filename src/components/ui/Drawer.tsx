"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Right-side modal drawer.
 *
 * Accessibility contract: labelled dialog, Escape closes, focus moves into the
 * panel on open and returns to the element that opened it on close, and Tab is
 * trapped inside while it is open. Background scroll is locked so the page
 * behind does not drift under the panel.
 */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  labelledById = "dt-drawer-title",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  labelledById?: string;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!open) return;
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [open, onClose],
  );

  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (firstFocusable ?? panel)?.focus();

    document.addEventListener("keydown", handleKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="dt-no-print fixed inset-0 z-40">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-chrome/35 motion-safe:animate-[fadeIn_120ms_ease-out]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-line bg-surface shadow-2xl outline-none motion-safe:animate-[slideIn_160ms_ease-out] sm:max-w-lg lg:max-w-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 id={labelledById} className="text-sm font-semibold leading-snug text-ink">
              {title}
            </h2>
            {subtitle ? <div className="mt-1 text-xs text-ink-subtle">{subtitle}</div> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close evidence drawer"
            className="shrink-0 rounded-md border border-line p-1.5 text-ink-muted hover:bg-surface-muted"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>

        {footer ? <div className="border-t border-line bg-surface-muted">{footer}</div> : null}
      </div>
    </div>
  );
}
