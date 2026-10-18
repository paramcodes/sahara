import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Sahara Atelier | Handcrafted Essentials",
  description:
    "A single-brand storefront built on Apple design principles. Handcrafted essentials with quiet refinement.",
  openGraph: {
    title: "Sahara Atelier | Handcrafted Essentials",
    description:
      "A single-brand storefront built on Apple design principles. Handcrafted essentials with quiet refinement.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "A single-brand storefront built on Apple design principles. Handcrafted essentials with quiet refinement.",
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ToastProvider>
          <div id="main-content">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
