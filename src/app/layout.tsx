import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DecisionTrace — Evidence Integrity for Drug-Asset Diligence",
    template: "%s · DecisionTrace",
  },
  description:
    "An independent prototype that turns an AI-generated drug-asset recommendation into an evidence-linked, uncertainty-aware decision record a scientific expert can inspect, challenge and approve.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-canvas text-ink">{children}</body>
    </html>
  );
}
