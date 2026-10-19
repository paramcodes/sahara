import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Sahara Atelier | Handcrafted Essentials",
  description:
    "A single-brand storefront built on Apple design principles. Handcrafted essentials with quiet refinement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
