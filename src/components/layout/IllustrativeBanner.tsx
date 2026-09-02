import { FlaskConical } from "lucide-react";

/**
 * Persistent, unmissable statement that the evidence on screen is synthetic.
 * Rendered above the workspace rather than tucked into a footer, because the
 * one failure mode that matters here is a viewer mistaking a demo record for a
 * real citation.
 */
export function IllustrativeBanner({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-md border border-amber/30 bg-amber-soft px-3 py-2 text-amber ${className ?? ""}`}
    >
      <FlaskConical aria-hidden className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
      <p className="text-xs leading-relaxed">
        <strong className="font-semibold">Illustrative evidence.</strong> Every source below is a
        synthetic record in a demonstration corpus. There are no real publications, trials,
        institutions or identifiers, and no source is shown as verified unless it was actually
        retrieved and validated.
      </p>
    </div>
  );
}
