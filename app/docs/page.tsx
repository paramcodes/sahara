import { Footer } from "@/components/storefront/Footer";
import { Navbar } from "@/components/storefront/Navbar";

export default function DocsPage() {
  const sections = [
    {
      title: "Architecture & Core Invariants",
      file: "docs/ARCHITECTURE.md",
      summary:
        "Single-store wedge architecture, multi-tenant ready with org_id on all tables, integer cents money rules, and immutable price snapshots.",
    },
    {
      title: "Technology Stack",
      file: "docs/TECH_STACK.md",
      summary:
        "Next.js 16 App Router, TypeScript, Tailwind CSS, PostgreSQL via Docker, Drizzle ORM, Better Auth, and Vitest.",
    },
    {
      title: "Data Model & Schema",
      file: "docs/DATA_MODEL.md",
      summary:
        "Complete pg-core database tables: orgs, users, products, specs, images, carts, orders, order items, and audit history.",
    },
    {
      title: "UI Components & Design System",
      file: "docs/UI_COMPONENTS.md",
      summary:
        "The 9 dependency-free Apple-HIG primitives (Button, Badge, Stepper, Switch, Segmented, Skeleton, EmptyState, Toast, Sheet) and CSS tokens.",
    },
    {
      title: "Features & User Flows",
      file: "docs/FEATURES_GUIDE.md",
      summary:
        "Buyer storefront browsing, specs table, shopping bag, order request checkout, order status tracker, and merchant admin inbox.",
    },
    {
      title: "Contributor Guide",
      file: "docs/CONTRIBUTING.md",
      summary:
        "Getting started in 5 minutes with Docker, pnpm seed, running Vitest, and coding conventions.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="mbe-10">
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
            Documentation & Architecture
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--ink)] mbs-1">
            Sahara Developer & Contributor Guide
          </h1>
          <p className="text-sm text-[var(--ink-secondary)] mbs-2 max-w-2xl leading-relaxed">
            Everything you or any new contributor needs to understand the stack, UI component layer,
            database design, and merchant workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((sec, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-mono text-[var(--ink-tertiary)] block mbe-1">
                  {sec.file}
                </span>
                <h3 className="text-lg font-semibold text-[var(--ink)] mbe-2">{sec.title}</h3>
                <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">{sec.summary}</p>
              </div>

              <div className="mbs-6 pbs-4 border-t border-black/[0.04] text-xs font-medium text-[var(--apple-blue)]">
                Available in project root repository ↗
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
